'use client'

import { useCurrentUserImage } from '@/hooks/use-current-user-image'
import { useCurrentUserName } from '@/hooks/use-current-user-name'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Ghost } from 'lucide-react'

export const CurrentUserAvatar = () => {
  const profileImage = useCurrentUserImage()
  const name = useCurrentUserName()
  const initials = name
    ?.split(' ')
    ?.map((word) => word[0])
    ?.join('')
    ?.toUpperCase()

  // Show ghost icon for anonymous users
  const isAnonymous = name === 'Anonymous'

  return (
    <Avatar className="h-8 w-8 rounded-lg">
      {profileImage && <AvatarImage src={profileImage} alt={initials} />}
      <AvatarFallback className="rounded-lg">
        {isAnonymous ? (
          <Ghost className="h-4 w-4 text-muted-foreground" />
        ) : (
          initials
        )}
      </AvatarFallback>
    </Avatar>
  )
}