import { Link } from 'react-router-dom'

export const LandingPage = () => {
  return (
    <main className='landing-page'>
      <div className='landing-container'>
        <h1>Stock Manager V5</h1>
        <p>The most advanced inventory system</p>
        <div className='actions'>
          <Link to='/login' className='btn'>Get started</Link>
          <Link to='/register' className='btn secundary'>Create Account</Link>
        </div>
      </div>
    </main>
  )
}