// src/api/tokenStore.ts

let accessToken: string | null = null

export const tokenStore = {
  // TODO: getter - return accessToken
  // TODO: setter - set accessToken
  get:() =>{
    return accessToken
  },
  set:(token:string | null) =>{
    accessToken=token
  }
}