import Link from 'next/link'
import React from 'react'

export default function VideoCom() {
  return (
    <div  className='mx-[40px]   h-auto gap-4 top-0 left-0 z-10  flex flex-col items-center justify-center'>
      <video
        src="https://res.cloudinary.com/puawndfo/video/upload/v1793369562/Flourish_Vid.mp4"
       
        Loop
        muted
        playsInline
        className= " h-full w-full rounded-[28px] object-cover"
        autoPlay={true}
      />

      {/* <Link href="/home">
  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition duration-300">
    Enter website
  </button>
</Link> */}
    </div>
  )
}
