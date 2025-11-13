// src/components/home2/common/UserAvatar.tsx

interface UserAvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  userId?: string; // new explicit user id for profile/chat actions
}

export default function UserAvatar({ src, alt, size = 'md', userId }: UserAvatarProps) {
  const dim = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-16 h-16' : 'w-10 h-10';
  return (
    <img
      src={src}
      alt={alt}
      className={`${dim} rounded-full object-cover border border-gray-300 cursor-pointer`}
      onClick={() => {
        if (userId) {
          // Open chat directly when clicking on a user profile/avatar
          window.dispatchEvent(new CustomEvent('circlo:openChat', { detail: { userId } }));
        }
      }}
    />
  );
}