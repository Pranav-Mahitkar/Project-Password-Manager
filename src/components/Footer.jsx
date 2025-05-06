import React from 'react'

const footer = () => {
  return (
    <div className='footcontainer bg-slate-800 flex justify-between items-center w-full px-2'>
      <div className='logo p-2 font-bold text-2xl text-green-500'>
        <span>&lt;</span>
        <span className='text-white'>Pass</span>
        OP
        <span>/&gt;</span>
        <p className='font-normal text-white text-sm'>PassCon Security. All Rights Reserved.&copy;</p>
      </div>
      <div className='footericons flex gap-2'>
        <a href="https://google.com/" target='_blank'><img className='invert w-8 h-8 cursor-pointer' src="icons/chrome.svg" /></a>
        <a href="https://reddit.com/" target='_blank'><img className='invert w-8 h-8 cursor-pointer' src="icons/reddit.svg" /></a>
        <a href="https://facebook.com/" target='_blank'><img className='invert w-8 h-8 cursor-pointer' src="icons/facebook.svg" /></a>
        <a href="https://x.com/" target='_blank'><img className='invert w-8 h-8 cursor-pointer' src="icons/twitter.svg" /></a>
        </div>
    </div>
  )
}

export default footer