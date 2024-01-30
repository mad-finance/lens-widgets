import { useEffect, useState, useMemo } from 'react'
import { css } from '@emotion/css'
import { ThemeColor, ProfileHandle, Theme, FarcasterProfile, ENSProfile } from './types'
import { LensClient, ProfileFragment, development, production } from "@lens-protocol/client";
import {
  formatProfilePicture,
  systemFonts,
  formatHandleColors,
  returnIpfsPathOrUrl,
  formatHandleList,
  getSubstring,
  getDisplayName,
} from './utils'
import { getButtonStyle } from "./Profile"
import { VerifiedBadgeIcon } from "./icons"
import { useGetOwnedMadFiBadge } from './hooks/useGetOwnedBadge';
import { LensLogo } from './icons/logos/Lens';
import { FarcasterLogo } from './icons/logos/Farcaster';
import { ENSLogo } from './icons/logos/ENS';

export function ProfileLarge({
  profileId,
  profileData,
  profileType = "lens",
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
  ipfsGateway,
  onFollowPress,
  environment = production,
  followButtonDisabled = false,
  isFollowed = false,
  renderMadFiBadge = false,
  allSocials = []
}: {
  profileId?: string,
  profileData?: any,
  profileType?: "lens" | "farcaster" | "ens";
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
  ipfsGateway?: string,
  onFollowPress?: (event) => void,
  environment?: (typeof development | typeof production),
  followButtonDisabled: boolean,
  isFollowed?: boolean,
  renderMadFiBadge?: boolean,
  allSocials?: any[]
}) {
  const [profile, setProfile] = useState<any | undefined>()
  const [followers, setFollowers] = useState<ProfileHandle[]>([])
  const {
    ownsBadge,
    verified
  } = useGetOwnedMadFiBadge(environment.name === 'production', profileData?.sponsor || profile?.sponsor, ethereumAddress || profileData?.ownedBy?.address || profileData.userAssociatedAddresses[0] || profile?.ownedBy?.address)

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
        const URI = `https://share.lens.xyz/u/${profile.handle.localName}`
        window.open(URI, '_blank')
      }
    }
  }

  async function fetchFollowers(id: string) {
    try {
      const lensClient = new LensClient({ environment })
      const followers = await lensClient.profile.followers({ of: id })

      const filteredProfiles = followers.items.filter(p => p.metadata?.picture)
      let first3 = JSON.parse(JSON.stringify(filteredProfiles.slice(0, 3)))
      first3 = first3.map(profile => {
        profile.handle = profile.handle.suggestedFormatted?.localName || profile.handle.localName
        profile.picture = returnIpfsPathOrUrl(profile.metadata.picture.optimized?.uri || profile.metadata.picture.raw?.uri, ipfsGateway)
        return profile
      })
      setFollowers(first3)
    } catch (err) {
      console.log('error fetching followers ...', err)
    }
  }

  async function fetchProfile() {
    if (profileData) {
      if (profileType === 'lens') {
        formatProfile(profileData)
        fetchFollowers(profileData.id)
        return;
      } else if (profileType === 'farcaster') {
        formatProfileFarcaster(profileData)
        return;
      } else if (profileType === 'ens') {
        formatProfileEns(profileData)
        return
      }
    }
    if (!profileId && !ethereumAddress && !handle) {
      return console.log('please pass in either a Lens profile ID or an Ethereum address')
    }
    const lensClient = new LensClient({ environment });
    if (handle) {
      try {
        const profile = await lensClient.profile.fetch({ forHandle: handle });
        if (!profile) throw new Error();

        formatProfile(profile)
        fetchFollowers(profile.id)
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

  function formatProfileFarcaster(profile: FarcasterProfile) {
    setProfile({
      metadata: {
        coverPicture: null,
        picture: {
          uri: profile.profileImage
        },
        bio: profile.profileBio,
        displayName: profile.profileDisplayName,
      },
      stats: {
        following: profile.followingCount,
        followers: profile.followerCount,
      },
      handle: {
        suggestedFormatted: {
          localName: profile.profileHandle
        }
      }
    })
  }

  function formatProfileEns(profile: ENSProfile) {
    setProfile({
      metadata: {
        coverPicture: null,
        picture: {
          uri: profile.avatar
        },
        bio: profile.name,
      },
      stats: {
        following: 0,
        followers: 0,
      }
    })
  }

  if (!profile) return null

  return (
    <div style={containerStyle} className={profileContainerClass}>
      <div className={headerImageContainerStyle}>
        <div onClick={onProfilePress}>
          {
            profile.metadata.coverPicture ? (
              <div
                style={getHeaderImageStyle(profile.metadata.coverPicture.url)}
              />
            ) : <div style={getHeaderImageStyle()} />
          }
          <div>
            {
              profile.metadata.picture ? (
                <div
                  className={getProfilePictureContainerStyle(theme)}
                >
                  <img
                    src={profile.metadata.picture.uri || profile.metadata.picture.url}
                    className={profilePictureStyle}
                  />
                </div>
              ) : null
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
          <p className={getProfileHandleStyle(theme)}>@{profile.handle?.suggestedFormatted?.localName.replace('@', '')}</p>
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
          {
            profileType !== "ens" && 
              <div style={followButtonContainerStyle || getButtonContainerStyle(hideFollowButton)}>
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
          }
        </div>
        <div onClick={onProfilePress} className={getFollowedByContainerStyle(theme)}>
          <div className={miniAvatarContainerStyle}>
            {
              followers.map(follower => (
                <div key={follower.handle} className={getMiniAvatarWrapper()}>
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
              formatHandleList(followers.map(follower => follower.handle))
            }</p>
        </div>
        <div className={css`
          display: flex;
          align-items: flex-start;
          margin-top: 20px;
        `}>
          {
            allSocials.map(social => {
              if (social.dappName === "lens") return <button className={hover()} onClick={() => formatProfile(profileData)}><LensLogo isDarkTheme={false} /></button>
              if (social.dappName === "farcaster") return <button className={hover()} onClick={() => formatProfileFarcaster(social)}><FarcasterLogo isDarkTheme={false} /></button>
            })
          }
        </div>
      </div>
    </div>
  )
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
  width: 138px;
  height: 138px;
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
  width: 128px;
  height: 128px;
  border-radius: 70px;
  object-fit: cover;
`

function getFollowedByContainerStyle(theme: Theme) {
  let color = ThemeColor.darkGray
  if (theme === Theme.dark) {
    color = ThemeColor.white
  }
  return css`
  margin-top: 20px;
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
    margin-top: 15px;
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
    padding: 50px 20px 20px;
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

function hover() {
  return css`
    &:hover {
      opacity: 70%;
      transition: opacity .2s;
    }
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
    bottom: -50px;
    background-color: ${backgroundColor};
    width: 138px;
    height: 138px;
    border-radius: 70px;
    margin-left: 20px;
  `
}

function getHeaderImageStyle(url?: string) {
  const backgroundImage = url ? `url(${url})` : 'none'
  return {
    height: '245px',
    backgroundColor: ThemeColor.lightGreen,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundImage: backgroundImage,
    borderTopLeftRadius: '18px',
    borderTopRightRadius: '18px',
  }
}
