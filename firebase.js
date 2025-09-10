// firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyC-KXnFzEliSECIH4jWI8Hf28eFuWRTn-c",
  authDomain: "world-savings-bank-5df02.firebaseapp.com",
  databaseURL: "https://world-savings-bank-5df02-default-rtdb.firebaseio.com",
  projectId: "world-savings-bank-5df02",
  storageBucket: "world-savings-bank-5df02.appspot.com",
  messagingSenderId: "361127802397",
  appId: "1:361127802397:web:cb0cc9dfa6d5d2db4238f4"
};
firebase.initializeApp(firebaseConfig);

window.App = {
  auth: firebase.auth(),
  db: firebase.database(),

  // بريد الآدمن المعتمد للصلاحيات:
  ADMIN_EMAIL: "abdulaziz.algharawi@gmail.com",

  // صور الحسابات:
  IMG: {
    admin: "https://i.postimg.cc/tTSfNWkn/image.jpg",
    omar:  "https://i.postimg.cc/LsmbdN0Z/image.jpg",
    shahad: "https://i.postimg.cc/d1xHyvQ8/image.jpg"
  },

  // أرقام PIN:
  PINS: { omar:'4000', shahad:'5000', admin:'9000' }
};
