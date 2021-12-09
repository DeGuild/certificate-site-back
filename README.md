# certificate-site-back

Firebase Functions + Alchemy web3 + Web3-token

APIs in this repository can be accessed with Authorization tokens and some APIs are restricted to the certificate manager owner only

## List of APIs

### Currently using APIS
#### POST
```
Path: /addCertificate
Request's body example:
{
    url: "https://firebasestorage.googleapis.com/v0/b/deguild-2021.appspot.com/o/images%2F30.png?alt=media",
    address: "0xaeE33993cfA61e5C0BF434c548512cAEF33d475C",
    title: "Introduction to Computer Programming",
    tokenId: "0"
}
```
```
Path: /deleteCertificate
Request's body example:
{
    address: "0xaeE33993cfA61e5C0BF434c548512cAEF33d475C",
    tokenId: "0"
}
```
## Deployment
Use this to develop your code locally

    firebase emulators:start 

Use this to deploy

    firebase deploy