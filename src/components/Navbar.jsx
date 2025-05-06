import React from 'react'

const Navbar = () => {
  return (
    <nav className='bg-slate-800 flex justify-between'>
      <div className='logo p-4 font-bold text-2xl text-green-500'>
        <span>&lt;</span>
        <span className='text-white'>Pass</span>
        OP
        <span>/&gt;</span>
      </div>
      <ul className='flex gap-3 p-4 text-white'>
        <li className='hover:font-bold'><a href="/">Home</a></li>
        <li className='hover:font-bold'><a href="/about">About</a></li>
        <li className='hover:font-bold'><a href="contact">Contact</a></li>
        <a href="https://github.com/" target='_blank'><img className='invert w-7 h-7' src="icons/github.svg" alt="github" /></a>
      </ul>
    </nav>
  )
}

export default Navbar