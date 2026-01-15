export function Footer() {
  return (
    <footer className='border-t mt-12 py-6'>
      <div className='container mx-auto px-4 text-center text-sm text-muted-foreground'>
        <p>Lyriks &mdash; Tes lyrics. Ton style. Ton image.</p>
        <p className='mt-2'>
          Propulsé par{' '}
          <a
            href='https://developer.spotify.com/'
            target='_blank'
            rel='noopener noreferrer'
            className='underline hover:text-foreground'
          >
            Spotify API
          </a>{' '}
          et{' '}
          <a
            href='https://lrclib.net/'
            target='_blank'
            rel='noopener noreferrer'
            className='underline hover:text-foreground'
          >
            lrclib
          </a>
        </p>
      </div>
    </footer>
  )
}
