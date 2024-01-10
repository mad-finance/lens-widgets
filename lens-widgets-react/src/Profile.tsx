import { useEffect, useState, useMemo } from 'react'
import { css } from '@emotion/css'
import { Profile, ThemeColor, ProfileHandle, Theme } from './types'
import { LensClient, ProfileFragment, development, production } from "@lens-protocol/client";
import { client } from './graphql/client'
import {
  profileById,
  profileByAddress,
  getFollowers,
  profile as profileQuery
} from './graphql'
import {
  formatProfilePicture,
  systemFonts,
  formatHandleColors,
  formatHandleList,
  getSubstring,
  getDisplayName,
} from './utils'
import { VerifiedBadgeIcon } from "./icons"
import { useGetOwnedMadFiBadge } from './hooks/useGetOwnedBadge';

export function Profile({
  profileId,
  profileData,
  ethereumAddress,
  handle, // ex: lens/madfinance
  onClick,
  theme = Theme.default,
  containerStyle = profileContainerStyle,
  followButtonStyle,
  followButtonContainerStyle,
  followButtonBackgroundColor,
  followButtonTextColor,
  hideFollowButton = true,
  hideFollowerCount = false,
  ipfsGateway,
  onFollowPress,
  skipFetchFollowers,
  environment = production,
  followButtonDisabled = false,
  isFollowed = false,
  renderMadFiBadge = false,
} : {
  profileId?: string,
  profileData?: any,
  handle?: string,
  ethereumAddress?: string,
  onClick?: () => void,
  theme?: Theme,
  containerStyle?: {},
  followButtonStyle?: {},
  followButtonContainerStyle?: {},
  followButtonBackgroundColor?: string,
  followButtonTextColor?: string,
  hideFollowButton?: boolean,
  hideFollowerCount?: boolean,
  ipfsGateway?: string,
  onFollowPress?: (event) => void,
  skipFetchFollowers?: boolean,
  environment?: (typeof development | typeof production),
  followButtonDisabled: boolean,
  isFollowed?: boolean,
  renderMadFiBadge?: boolean,
}) {
  const [profile, setProfile] = useState<any | undefined>()
  const [followers, setFollowers] = useState<ProfileHandle[]>([])
  const {
    ownsBadge,
    verified
  } = useGetOwnedMadFiBadge(environment.name === 'production', profile?.sponsor, profile?.ownedBy?.address)

  useEffect(() => {
    fetchProfile()
  }, [profileId, handle, ethereumAddress])

  const shouldRenderBadge = useMemo(() => {
    return renderMadFiBadge && ownsBadge && verified;
  }, [renderMadFiBadge, ownsBadge, verified]);

  function onProfilePress() {
    if (onClick) {
      onClick()
    } else {
       if (profile) {
        const { localName, namespace } = profile.handle
        const URI = `https://share.lens.xyz/u/${localName}.${namespace}`
        window.open(URI, '_blank')
       }
    }
  }

  async function fetchFollowers(id: string) {
    if (skipFetchFollowers) return;

    try {
      const { data } = await client
        .query(getFollowers, {
          profileId: id
        })
       .toPromise()
      let filteredProfiles = data.followers.items.filter(p => p.handle?.fullHandle)
      filteredProfiles = filteredProfiles.filter(p => p.metadata && p.metadata.picture)
      filteredProfiles = filteredProfiles.filter(p => p.metadata.picture.optimized)
      let first3 = JSON.parse(JSON.stringify(filteredProfiles.slice(0, 3)))
      first3 = first3.map(profile => {
        profile.handle = profile.handle.fullHandle
        profile.picture = profile.metadata.picture.optimized.uri
        return profile
      })
      setFollowers(first3)
    } catch (err) {
      console.log('error fetching followers ...', err)
    }
  }

  async function fetchProfile() {
    if (profileData) {
      formatProfile(profileData)
      fetchFollowers(profileData.id)
      return;
    }
    if (!profileId && !ethereumAddress && !handle) {
      return console.log('please pass in either a Lens profile ID or an Ethereum address')
    }
    const lensClient = new LensClient({ environment });
    if (handle) {
      try {
        handle = handle.toLowerCase()
        const { data } = await client
          .query(profileQuery, {
            handle
          })
          .toPromise()
        formatProfile(data.profile)
        fetchFollowers(data.profile.id)
      } catch (err) {
        console.log('error fetching profile... ', err)
      }
    } else if (profileId) {
      try {
        const profile = await lensClient.profile.fetch({ forProfileId: profileId })
        if (!profile) throw new Error();

        formatProfile(profile)
        fetchFollowers(profileId)
      } catch (err) {
        console.log('error fetching profile... ', err)
      }
    } else {
      throw new Error('not supporting address yet');
    }
  }
  function formatProfile(profile: ProfileFragment) {
    let copy = formatProfilePicture(profile)
    setProfile(copy)
  }
  if (!profile) return null

  return (
    <div style={containerStyle} className={profileContainerClass}>
      <div className={headerImageContainerStyle}>
        <div onClick={onProfilePress}>
          {
            profile.metadata.coverPicture?.optimized?.uri ? (
              <div
                style={getHeaderImageStyle(profile?.metadata.coverPicture?.optimized?.uri)}
              />
              ) : <div style={getHeaderImageStyle()} />
          }
          <div>
          {
            profile.metadata.picture && (
              <div
                className={getProfilePictureContainerStyle(theme)}
              >
                <img
                  src={profile.metadata.picture.__typename === "ImageSet" ?
                  profile.metadata.picture.optimized.uri :
                  profile.metadata.picture.image.optimized.uri
                  }
                  className={profilePictureStyle}
                />
              </div>
              )
          }
          {
            profile.picture === null && (
              <div className={emptyProfilePictureStyle} />
            )
          }
          </div>
        </div>
      </div>
      <div className={getProfileInfoContainerStyle(theme)}>
        <div className={profileNameAndBioContainerStyle} onClick={onProfilePress}>
          <div className="flex gap-x-2">
            <p className={profileNameStyle}>{getDisplayName(profile)}</p>
            {shouldRenderBadge && <span className="mt-2"><VerifiedBadgeIcon /></span>}
          </div>
          <p className={getProfileHandleStyle(theme)}>{profile.handle?.suggestedFormatted?.localName}</p>
          {
            profile.metadata?.bio && (
              <p className={bioStyle} dangerouslySetInnerHTML={{
                __html: formatHandleColors(getSubstring(profile.metadata.bio))
              }} />
            )
          }
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px' }}>
          <div onClick={onProfilePress} className={getStatsContainerStyle(theme)}>
            <p>
              {profile.stats.following.toLocaleString('en-US')} <span>Following</span>
            </p>
            <p>
              {profile.stats.followers.toLocaleString('en-US')} <span>Followers</span>
            </p>
          </div>
          <div
            style={followButtonContainerStyle || getButtonContainerStyle(hideFollowButton)}
          >
            <button
              disabled={followButtonDisabled || isFollowed}
              onClick={onFollowPress}
              style={
                followButtonStyle ||
                getButtonStyle(
                  theme,
                  !followButtonDisabled ? followButtonBackgroundColor : ThemeColor.darkGray,
                  followButtonTextColor,
                  followButtonDisabled || isFollowed
                )
              }
            >{!isFollowed ? "Follow" : "Following"}</button>
          </div>
        </div>
        {!skipFetchFollowers && (
          <div onClick={onProfilePress} className={getFollowedByContainerStyle(theme)}>
            <div className={miniAvatarContainerStyle}>
              {
                followers.map(follower => (
                  <div key={follower.handle.localName} className={getMiniAvatarWrapper()}>
                    <img src={follower.picture} className={getMiniAvatarStyle(theme)} />
                  </div>
                ))
              }
            </div>
            <p>
              {
                Boolean(followers.length) && <span>Followed by</span>
              }
              {
                formatHandleList(followers.map(follower => follower.handle.suggestedFormatted.localName))
              }</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function ActionButton({
  label,
  disabled,
  onClick,
  theme,
  textColor,
  backgroundColor,
}: {
    label: string,
    disabled: boolean,
    onClick: (e) => void,
    theme: Theme,
    textColor?: string,
    backgroundColor?: string,
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={
        getButtonStyle(
          theme,
          backgroundColor,
          textColor,
          disabled
        )
      }
    >{label}</button>
  );
}

const profileContainerStyle = {
  overflow: 'hidden',
  cursor: 'pointer'
}

const emptyProfilePictureStyle = css`
  background-color: green;
  width: 60px;
  height: 60px;
  display: flex;
  left: 0;
  bottom: -50px;
  width: 66px;
  height: 66px;
  border-radius: 70px;
  position: absolute;
  margin-left: 20px;
  border: 4px solid white;
`

const system = css`
  font-family: ${systemFonts} !important
`

const headerImageContainerStyle = css`
  position: relative;
`

const profileNameAndBioContainerStyle = css`
  margin-top: 15px;
`

const profileNameStyle = css`
  font-size: 26px;
  font-weight: 700;
  margin: 0;
`

function getProfileHandleStyle(theme: Theme) {
  let color = ThemeColor.darkGray
  if (theme === Theme.dark) {
    color = ThemeColor.white
  }

  return css`
  font-size: 16px;
  font-weight: 400;
  margin: 0;
  opacity: 0.8;
  color: ${color}
`
}

const bioStyle = css`
  font-weight: 500;
  margin-top: 20px;
  margin-bottom: 0;
  line-height: 24px;
`

const profileContainerClass = css`
  width: 510px;
  @media (max-width: 510px) {
    width: 100%
  }
  * {
    ${system};
  }
`

const miniAvatarContainerStyle = css`
  display: flex;
  margin-left: 10px;
  margin-right: 14px;
`

const profilePictureStyle = css`
  width: 62px;
  height: 62px;
  border-radius: 70px;
`

function getFollowedByContainerStyle(theme:Theme) {
  let color = ThemeColor.darkGray
  if (theme === Theme.dark) {
    color = ThemeColor.white
  }
  return css`
  display: flex;
  color: ${color};
  align-items: center;
  span {
    opacity: .5;
    margin-right: 4px;
  }
  p {
    margin-right: 5px;
    margin-bottom: 0;
    margin-top: 0;
    font-weight: 600;
    font-size: 14px;
  }
`
}

function getStatsContainerStyle(theme: Theme) {
  let color = ThemeColor.darkGray
  if (theme === Theme.dark) {
    color = ThemeColor.white
  }
  return css`
    display: flex;
    margin-top: 25px;
    * {
      font-weight: 600;
    }
    p {
      margin-right: 10px;
      margin-top: 0;
      margin-bottom: 0;
    }
    span {
      color: ${color};
      opacity: 50%;
    }
    @media (max-width: 510px) {
      p {
        margin: 8px 10px 8px 0px;
      }
    }
  `
}

function getProfileInfoContainerStyle(theme: Theme) {
  let backgroundColor = ThemeColor.white
  let color = ThemeColor.black
  if (theme === Theme.dark) {
    backgroundColor = ThemeColor.lightBlack
    color = ThemeColor.white
  }
  return css`
    background-color: ${backgroundColor};
    padding: 20px 20px 10px;
    p {
      color: ${color};
    }
    border-bottom-left-radius: 18px;
    border-bottom-right-radius: 18px;
  `
}

function getButtonContainerStyle(hidden) {
  return {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end',
    visibility: hidden ? 'hidden' : 'visible' as any
  }
}

function getMiniAvatarWrapper() {
  return css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    margin-left: -10px;
    borderRadius: 20px;
  `
}

function getMiniAvatarStyle(theme: Theme) {
  let color = ThemeColor.white
  if (theme === Theme.dark) {
    color = ThemeColor.lightBlack
  }
  return css`
    width: 34px;
    height: 34px;
    border-radius: 20px;
    outline: 2px solid ${color};
    background-color: ${color};
  `
}

function getProfilePictureContainerStyle(theme: Theme) {
  let backgroundColor = ThemeColor.white
  if (theme === Theme.dark) {
    backgroundColor = ThemeColor.lightBlack
  }
  return css`
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    left: 0;
    bottom: -30px;
    background-color: ${backgroundColor};
    width: 66px;
    height: 66px;
    border-radius: 70px;
    margin-left: 20px;
  `
}

function getHeaderImageStyle(url?:string) {
  const backgroundImage = url ? `url(${url})` : 'none'
  return {
    height: '120px',
    backgroundColor: ThemeColor.lightGreen,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundImage: backgroundImage,
    borderTopLeftRadius: '18px',
    borderTopRightRadius: '18px',
  }
}

export function getButtonStyle(theme: Theme, bgColor?: string, textColor?: string, disabled?: boolean) {
  let backgroundColor = bgColor || '#3d4b41'
  let color = textColor || 'white'
  if (theme === Theme.dark) {
    color = textColor || '#191919'
    backgroundColor = bgColor || '#C3E4CD'
  }
  let borderColor = bgColor == 'transparent'
    ? ThemeColor.lightGray
    : undefined
  color = bgColor == 'transparent' ? ThemeColor.lightGray : color
  return {
    marginTop: '10px',
    outline: 'none',
    border: 'none',
    padding: '4px 16px',
    backgroundColor,
    borderRadius: '50px',
    borderColor,
    borderWidth: borderColor ? "1px" : undefined,
    borderStyle: borderColor ? "solid" : undefined,
    color,
    fontSize: '16px',
    fontWeight: '500',
    cursor: disabled ? 'default' : 'pointer'
  }
}