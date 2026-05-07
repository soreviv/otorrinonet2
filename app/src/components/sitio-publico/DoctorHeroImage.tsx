'use client'
import { useState } from 'react'
import Image from 'next/image'

interface Props {
  src: string
  initials: string
}

export function DoctorHeroImage({ src, initials }: Props) {
  const [imgError, setImgError] = useState(false)

  if (imgError) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="w-28 h-28 rounded-full bg-white/15 border-4 border-white/30 flex items-center justify-center">
          <span className="text-5xl font-bold text-white/90">{initials}</span>
        </div>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt="Retrato del Dr. Alejandro Viveros Domínguez, médico otorrinolaringólogo especialista en cirugía de cabeza y cuello en Ciudad de México"
      fill
      sizes="(max-width: 640px) 240px, (max-width: 768px) 288px, (max-width: 1024px) 288px, 320px"
      className="object-cover z-10"
      onError={() => setImgError(true)}
      priority
    />
  )
}
