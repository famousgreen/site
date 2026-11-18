import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import type { Dict, ShootType } from './i18n'
import { caseImages, caseMeta, press, shootRibbons } from './content'
import type { CaseId, Extra } from './content'
import { Reveal } from './Reveal'

const shootIds: ShootType[] = ['portrait', 'wedding', 'commercial']

export function About({ x, onBook }: { x: Extra; onBook: () => void }) {
  const a = x.about
  return (
    <section className="about" id="about" aria-labelledby="about-title">
      <div className="about-head">
        <h2 className="label" id="about-title">{a.label}</h2>
        <p className="about-title">{a.title}</p>
      </div>
      <Reveal className="about-body">
        <figure className="about-portrait">
          <img src="/images/portfolio/about-hanna.jpg" alt={a.alt} loading="lazy" />
          <figcaption>Hanna Chauvat — Paris / Normandy</figcaption>
        </figure>
        <div className="about-text">
          <p className="about-lead">{a.lead}</p>
          {a.paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
          <button type="button" className="text-cta" onClick={onBook}>
            {a.cta} <ArrowUpRight aria-hidden="true" />
          </button>
        </div>
        <div className="about-geo">
          <h3 className="label">{a.geoLabel}</h3>
          <ul>
            {a.geo.map((item) => (
              <li key={item.place}>
                <strong>{item.place}</strong>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="about-facts">
          <h3 className="label">{a.factsLabel}</h3>
          <dl>
            {a.facts.map((value, i) => (
              <div key={a.factLabels[i]}>
                <dt>{value}</dt>
                <dd>{a.factLabels[i]}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="about-press">
          <h3 className="label">{a.pressLabel}</h3>
          <ul>
            {press.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  )
}

export function Cases({ x, onOpen }: { x: Extra; onOpen: (id: CaseId) => void }) {
  return (
    <section className="cases" id="cases" aria-labelledby="cases-title">
      <h2 className="label" id="cases-title">{x.cases.label}</h2>
      <p className="section-title">{x.cases.title}</p>
      <ul className="case-list">
        {caseMeta.map((item, i) => {
          const copy = x.caseItems[item.id]
          return (
            <li key={item.id} className={`case-card case-${i + 1}`}>
              <Reveal>
                <article>
                  <figure>
                    <img src={item.cover} alt="" loading="lazy" style={{ objectPosition: item.coverPosition }} />
                  </figure>
                  <p className="case-meta">
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    <span>{copy.category}</span>
                    <span>{copy.location}</span>
                  </p>
                  <h3>
                    <button type="button" className="case-open" onClick={() => onOpen(item.id)} aria-haspopup="dialog">
                      {item.title}
                    </button>
                  </h3>
                  <p className="case-context">{copy.context}</p>
                  <span className="case-more" aria-hidden="true">
                    {x.cases.open} <ArrowUpRight />
                  </span>
                </article>
              </Reveal>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Ribbon({ name, shoot, x }: { name: string; shoot: ShootType; x: Extra }) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef<{ startX: number; startLeft: number; moved: boolean } | null>(null)
  const photos = shootRibbons[shoot]

  const step = (direction: number) => {
    const node = ref.current
    if (node) node.scrollBy({ left: direction * node.clientWidth * 0.8, behavior: 'smooth' })
  }

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      step(event.key === 'ArrowRight' ? 1 : -1)
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      ref.current?.scrollTo({ left: event.key === 'Home' ? 0 : ref.current.scrollWidth, behavior: 'smooth' })
    }
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !ref.current) return
    drag.current = { startX: event.clientX, startLeft: ref.current.scrollLeft, moved: false }
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current
    const node = ref.current
    if (!state || !node) return
    const delta = event.clientX - state.startX
    if (!state.moved && Math.abs(delta) > 4) {
      state.moved = true
      node.classList.add('dragging')
      node.setPointerCapture(event.pointerId)
    }
    if (state.moved) node.scrollLeft = state.startLeft - delta
  }

  const endDrag = () => {
    drag.current = null
    ref.current?.classList.remove('dragging')
  }

  return (
    <div className="ribbon-wrap">
      <div
        ref={ref}
        className="ribbon"
        role="region"
        tabIndex={0}
        aria-label={x.shoots.ribbonLabel(name)}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {photos.map((photo, i) => (
          <figure key={`${photo.src}-${i}`} style={{ aspectRatio: photo.ratio }}>
            <img
              src={photo.src}
              alt={x.shoots.photoAlt(name, i + 1, photos.length)}
              loading="lazy"
              draggable={false}
              style={{ objectPosition: photo.position }}
            />
          </figure>
        ))}
      </div>
      <div className="ribbon-tools">
        <span>{x.shoots.ribbonHint}</span>
        <div>
          <button type="button" onClick={() => step(-1)} aria-label={x.shoots.prev}>
            <ChevronLeft aria-hidden="true" />
          </button>
          <button type="button" onClick={() => step(1)} aria-label={x.shoots.next}>
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function Shoots({ t, x, onBook }: { t: Dict; x: Extra; onBook: (shoot: ShootType) => void }) {
  const [open, setOpen] = useState<ShootType | null>('portrait')

  return (
    <section className="work" id="work" aria-labelledby="work-title">
      <h2 className="label" id="work-title">{t.workLabel}</h2>
      <div className="accordion">
        {shootIds.map((id, i) => {
          const copy = t.shoots[id]
          const panel = x.shoots.panels[id]
          const expanded = open === id
          return (
            <div className={`acc-item ${expanded ? 'is-open' : ''}`} key={id}>
              <h3>
                <button
                  type="button"
                  className="acc-trigger"
                  id={`acc-${id}-trigger`}
                  aria-expanded={expanded}
                  aria-controls={`acc-${id}-panel`}
                  onClick={() => setOpen(expanded ? null : id)}
                >
                  <span className="acc-index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="acc-title">{copy.name}</span>
                  <span className="acc-short">{copy.desc}</span>
                  <Plus className="acc-icon" aria-hidden="true" />
                </button>
              </h3>
              <div
                className="acc-panel"
                id={`acc-${id}-panel`}
                role="region"
                aria-labelledby={`acc-${id}-trigger`}
                hidden={!expanded}
              >
                <div className="acc-grid">
                  <div className="acc-copy">
                    <h4 className="label">{x.shoots.outcomeLabel}</h4>
                    <p className="acc-outcome">{panel.outcome}</p>
                  </div>
                  <div className="acc-details">
                    <h4 className="label">{x.shoots.detailsLabel}</h4>
                    <ul>
                      {panel.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                    <button type="button" className="text-cta" onClick={() => onBook(id)}>
                      {panel.cta} <ArrowUpRight aria-hidden="true" />
                    </button>
                  </div>
                </div>
                {expanded && <Ribbon name={copy.short} shoot={id} x={x} />}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function ProjectViewer({
  x,
  activeId,
  onClose,
  onNavigate,
  onBook,
}: {
  x: Extra
  activeId: CaseId
  onClose: () => void
  onNavigate: (id: CaseId) => void
  onBook: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const index = caseMeta.findIndex((item) => item.id === activeId)
  const item = caseMeta[index]
  const copy = x.caseItems[activeId]
  const images = caseImages[activeId]
  const prev = caseMeta[(index + caseMeta.length - 1) % caseMeta.length]
  const next = caseMeta[(index + 1) % caseMeta.length]

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    document.body.classList.add('modal-open')
    ref.current?.querySelector<HTMLElement>('.viewer-close')?.focus()
    return () => {
      document.body.classList.remove('modal-open')
      previous?.focus?.()
    }
  }, [])

  useEffect(() => {
    ref.current?.scrollTo({ top: 0 })
  }, [activeId])

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
      return
    }
    if (event.key !== 'Tab' || !ref.current) return
    const focusable = Array.from(
      ref.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]'),
    )
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      ref={ref}
      className="viewer"
      role="dialog"
      aria-modal="true"
      aria-label={x.viewer.label(item.title)}
      onKeyDown={onKeyDown}
    >
      <header className="viewer-bar">
        <button type="button" className="viewer-back" onClick={onClose}>
          <ArrowLeft aria-hidden="true" /> {x.viewer.back}
        </button>
        <span className="viewer-count" aria-live="polite">{x.viewer.counter(index + 1, caseMeta.length)}</span>
        <button type="button" className="viewer-close" onClick={onClose} aria-label={x.viewer.close}>
          <X aria-hidden="true" />
        </button>
      </header>

      <article className="viewer-body" key={activeId}>
        <p className="viewer-meta">
          <span>{copy.category}</span>
          <span>{copy.location}</span>
          <span>{item.year}</span>
        </p>
        <h2 className="viewer-title">{item.title}</h2>

        <div className={`collage collage-${index % 2 === 0 ? 'a' : 'b'}`} role="group" aria-label={x.viewer.collage}>
          {images.map((image, i) => (
            <figure key={`${image.src}-${i}`} className={`c-${i + 1}`}>
              <img src={image.src} alt={x.viewer.photoAlt(item.title, i + 1)} style={{ objectPosition: image.position }} />
            </figure>
          ))}
        </div>

        <div className="viewer-info">
          <div>
            <h3 className="label">{x.cases.context}</h3>
            <p>{copy.context}</p>
          </div>
          <div>
            <h3 className="label">{x.cases.result}</h3>
            <p>{copy.result}</p>
          </div>
          <dl>
            <div><dt>{x.cases.category}</dt><dd>{copy.category}</dd></div>
            <div><dt>{x.cases.location}</dt><dd>{copy.location}</dd></div>
            <div><dt>{x.cases.year}</dt><dd>{item.year}</dd></div>
            <div><dt>{x.cases.deliverable}</dt><dd>{copy.deliverable}</dd></div>
          </dl>
        </div>

        <button type="button" className="text-cta viewer-book" onClick={onBook}>
          {x.viewer.book} <ArrowUpRight aria-hidden="true" />
        </button>
      </article>

      <nav className="viewer-nav" aria-label={x.cases.label}>
        <button type="button" onClick={() => onNavigate(prev.id)} aria-label={`${x.viewer.prev}: ${prev.title}`}>
          <ArrowLeft aria-hidden="true" />
          <span><small>{x.viewer.prev}</small>{prev.title}</span>
        </button>
        <button type="button" onClick={() => onNavigate(next.id)} aria-label={`${x.viewer.next}: ${next.title}`}>
          <span><small>{x.viewer.next}</small>{next.title}</span>
          <ArrowRight aria-hidden="true" />
        </button>
      </nav>
    </div>
  )
}
