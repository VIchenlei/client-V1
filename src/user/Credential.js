// NEED to allow the browser save the password.

// The Uglify in webpack will throw ERROR when use async function here.
// Do NOT know why yet???

function setUserCredential (nodeName, nodePwd, nameLabel, pwdLabel) {
  if (navigator.credentials) {
    navigator.credentials.get({ password: true }).then((cred) => {
      if (cred && cred.type === 'password') {
        // console.log('get credential OK.', cred)
        nodeName.value = cred.id
        nodePwd.value = cred.password
        if(nodeName.value){
          nameLabel.classList.add('mdc-text-field__label--float-above')
          nameLabel.innerText = '帐号:'
        }
        if(nodePwd.value){
          pwdLabel.classList.add('mdc-text-field__label--float-above')
          pwdLabel.innerText = '密码:'
        }
      } else {
        console.warn('Get credential ERROR. ', cred)
      }
    })
  }else {
    console.warn('Handle sign-in the way you did before.')
  }
}

function saveCredential (name, pwd) {
  if (navigator.credentials) {
    let cred = new window.PasswordCredential({
      id: name,
      password: pwd,
      name: name
      // iconURL: `${window.location.href}img/icon168.png`
    })

    navigator.credentials.store(cred).then(() => {
      console.log('Save credential OK.', cred)
      return true
    }).catch(() => {
      console.warn('Save credential FAILED.')
    })
  }
}

// async function setUserCredential (nodeName, nodePwd) {
//   let ret = null
//   if (navigator.credentials) {
//     let cred = await navigator.credentials.get({password: true})

//     if (cred && cred.type === 'password') {
//       console.log('get credential OK.', cred)
//       nodeName.value = cred.id
//       nodePwd.value = cred.password
//     } else {
//       console.warn('Get credential ERROR. ', cred)
//     }
//   }
//   return ret
// }

// async function saveCredential (name, pwd) {
//   let ret = false
//   if (navigator.credentials) {
//     let cred = new window.PasswordCredential({
//       id: name,
//       password: pwd,
//       name: name
//     // iconURL: `${window.location.href}img/icon168.png`
//     })

//     return navigator.credentials.store(cred).then(() => {
//       console.log('Save credential OK.', cred)
//       return true
//     }).catch(() => {
//       console.warn('Save credential FAILED.')
//     })
//   }

//   return ret
// }

export { setUserCredential, saveCredential }
