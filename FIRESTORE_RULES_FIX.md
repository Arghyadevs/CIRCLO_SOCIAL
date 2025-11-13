# Firestore Security Rules Fix for Chat Section

## Problem
The current Firestore security rules are causing "Missing or insufficient permissions" errors because they don't properly support the `array-contains` query pattern used in the chat section.

## Current Rules (INCORRECT)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }
    
    match /dmConversations/{id} {
      allow read, update: if isSignedIn() && request.auth.uid in resource.data.participants;
      allow create: if isSignedIn() && request.auth.uid in request.resource.data.participants;
      allow delete: if false;
    }
    
    match /dmMessages/{id} {
      allow read: if isSignedIn()
        && request.auth.uid in get(/databases/$(database)/documents/dmConversations/$(resource.data.participantsKey)).data.participants;
      allow create: if isSignedIn()
        && request.auth.uid in get(/databases/$(database)/documents/dmConversations/$(request.resource.data.participantsKey)).data.participants
        && request.resource.data.fromId == request.auth.uid;
      allow update, delete: if false;
    }
  }
}
```

## Updated Rules (CORRECT)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function to check if conversationId matches the pattern userId1__userId2
    function isValidConversationId(conversationId) {
      return conversationId.matches('.*__.*');
    }
    
    // Helper function to check if user is part of conversation based on ID
    function isParticipantByConversationId(conversationId, userId) {
      return conversationId.split('__')[0] == userId || conversationId.split('__')[1] == userId;
    }
    
    match /dmConversations/{conversationId} {
      // Allow list queries where participants array-contains the current user
      allow list: if isSignedIn() && request.auth.uid in resource.data.participants;
      
      // Allow get (single document read) if:
      // 1. Document exists and user is a participant, OR
      // 2. Document doesn't exist but user is in the conversationId (for checking before creation)
      allow get: if isSignedIn() && (
        (resource != null && request.auth.uid in resource.data.participants) ||
        (resource == null && isValidConversationId(conversationId) && isParticipantByConversationId(conversationId, request.auth.uid))
      );
      
      // Allow create if user is in the participants array and conversationId matches pattern
      allow create: if isSignedIn() 
        && request.auth.uid in request.resource.data.participants
        && request.resource.data.participants.size() == 2
        && request.resource.data.participantsKey is string
        && request.resource.data.participantsKey == conversationId
        && isValidConversationId(conversationId)
        && isParticipantByConversationId(conversationId, request.auth.uid);
      
      // Allow update if user is a participant
      allow update: if isSignedIn() && request.auth.uid in resource.data.participants;
      
      // Never allow delete
      allow delete: if false;
    }
    
    match /dmMessages/{messageId} {
      // Allow reading messages if user is in the conversation's participants
      allow read: if isSignedIn()
        && request.auth.uid in get(/databases/$(database)/documents/dmConversations/$(resource.data.participantsKey)).data.participants;
      
      // Allow creating messages if:
      // 1. User is signed in
      // 2. User is in the conversation's participants
      // 3. The fromId matches the authenticated user
      allow create: if isSignedIn()
        && request.auth.uid in get(/databases/$(database)/documents/dmConversations/$(request.resource.data.participantsKey)).data.participants
        && request.resource.data.fromId == request.auth.uid
        && request.resource.data.participantsKey is string
        && request.resource.data.toId is string
        && request.resource.data.text is string;
      
      // Never allow update or delete
      allow update, delete: if false;
    }
  }
}
```

## Key Changes
1. **Split `read` into `list` and `get`**: This is crucial for supporting `array-contains` queries
2. **Added helper functions**: To validate conversation IDs and check participation
3. **Fixed `get` rule**: Now allows reading non-existent documents if the user is part of the conversation ID pattern
4. **Added validation**: Ensures required fields are present and of correct type
5. **Added size check**: Ensures conversations always have exactly 2 participants
6. **Added conversationId validation**: Ensures the document ID matches the participantsKey

## How to Apply
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: "CircloProd"
3. Navigate to: Firestore Database → Rules
4. Replace the existing rules with the "Updated Rules" above
5. Click "Publish"

## Why This Fixes the Issue
The original rules used `allow read` which doesn't properly support Firestore's query validation for `array-contains`. By splitting it into `allow list` and `allow get`, Firestore can properly validate that:
- List queries (like `where("participants", "array-contains", currentUserId)`) are allowed
- Single document reads are allowed if the user is a participant

This is a known Firestore security rules pattern for working with array-contains queries.