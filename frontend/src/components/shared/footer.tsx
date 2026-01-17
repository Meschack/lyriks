export function Footer() {
  return (
    <footer className='border-t mt-12 py-6'>
      <div className='container mx-auto px-4 text-center text-sm text-muted-foreground'>
        <p>Lyriks &mdash; Your lyrics. Your style. Your image.</p>
        <p className='mt-2'>
          Powered by{' '}
          <a
            href='https://docs.genius.com'
            target='_blank'
            rel='noopener noreferrer'
            className='underline hover:text-foreground'
          >
            Rap Genius API
          </a>{' '}
          and{' '}
          <a
            href='https://lrclib.net'
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
