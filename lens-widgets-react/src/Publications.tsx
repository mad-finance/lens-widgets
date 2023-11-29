import {
  useEffect, useState
} from 'react'
import { css } from '@emotion/css'
import { client, profileByHandle, getPublications } from './graphql'
import { Publication as PublicationComponent } from './Publication'
import { Theme } from './types'

enum LimitType {
  TEN = 'TEN',
  TWENTYFIVE = 'TWENTYFIVE',
  FIFTY = 'FIFTY'
}

export function Publications({
  profileId,
  handle,
  theme,
  numberOfPublications,
  publications,
  isAuthenticated = false,
  hideCommentButton = false,
  hideQuoteButton = false,
  hideShareButton = false,
  onLikeButtonClick,
} : {
  profileId?: string,
  handle?: string,
  theme?: Theme,
  numberOfPublications?: number,
  publications?: any[],
  isAuthenticated?: boolean,
  hideCommentButton?: boolean,
  hideQuoteButton?: boolean,
  hideShareButton?: boolean,
  onLikeButtonClick?: (e, publicationId: string) => void,
}) {
  const [_publications, setPublications] = useState<any[] | undefined>([])

  useEffect(() => {
    if (!publications?.length) {
      fetchPublications()
    } else {
      setPublications(publications)
    }
  }, [profileId, handle, publications])

  async function fetchPublications() {
    let id = profileId
    let limit:LimitType = LimitType.TEN
    if (numberOfPublications) {
      if (numberOfPublications === 25) {
        limit = LimitType.TWENTYFIVE
      }
      if (numberOfPublications === 50) {
        limit = LimitType.FIFTY
      }
    }
    if (!id && handle) {
      try {
        const response = await client.query(profileByHandle, {
          handle
        }).toPromise()
        id = response.data.profile.id
      } catch (err) {
        console.log('error fetching profile: ', err)
      }
    }
    try {
      const response = await client.query(getPublications, {
        profileId: id,
        limit: parseInt(limit)
      }).toPromise()
      if (response?.data?.publications?.items) {
        setPublications(response?.data?.publications?.items)
      }
    } catch (err) {
      console.log('error fetching publications: ', err)
    }
  }

  return (
    <div className={publicationsContainerStyle}>
      {
        publications?.map(publication => {
          return (
            <div key={`${publication.id}`} className={publicationContainerStyle}>
              <PublicationComponent
                publicationData={publication}
                publicationId={publication.id}
                theme={theme}
                isAuthenticated={isAuthenticated}
                hideCommentButton={hideCommentButton}
                hideQuoteButton={hideQuoteButton}
                hideShareButton={hideShareButton}
                onLikeButtonClick={(e) => { if(onLikeButtonClick) onLikeButtonClick(e, publication.id) }}
              />
            </div>
          )
        })
      }
    </div>
  )
}

const publicationsContainerStyle = css`
  @media (max-width: 510px) {
    width: 100%
  }
`

const publicationContainerStyle = css`
  margin-bottom: 12px;
`