import type { AnchorHTMLAttributes } from 'react'

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

/** 외부(http) 링크는 새 탭으로, mailto: 등은 같은 탭으로 여는 <a>. */
export function ExternalLink({ href, ...rest }: Props) {
  const external = href.startsWith('http')
  return <a href={href} target={external ? '_blank' : undefined} rel="noreferrer" {...rest} />
}
