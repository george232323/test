// pages/index.js
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/index.html',
      permanent: false
    }
  }
}

export default function Page() {
  return null
}
<link rel="stylesheet" href="/style.css" />
