import type { ResourcesConfig } from 'aws-amplify'

const env = (import.meta as any).env

export const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: env.VITE_COGNITO_USER_POOL_ID || '',
      userPoolClientId: env.VITE_COGNITO_USER_POOL_CLIENT_ID || '',
    }
  }
}

