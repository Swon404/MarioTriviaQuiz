import { useState } from 'react';
import { QUESTIONS } from './mario/questions.ts';
const LEARNING_QUESTIONS = QUESTIONS.filter(question => question.sourceReview?.status === 'source-checked');

export function LearningCard({ id }: { id: string }) {
  const card = LEARNING_QUESTIONS.find(item => item.id === id);
  if (!card) return null;
  return <article className="learning-topic-card">
    <h3>{card.answer}</h3>
    <p>{card.prompt}</p>
    <p>{card.explanation}</p>
    <p><strong>Did you know?</strong> {card.funFact}</p>
    <a href={card.sourceUrl} target="_blank" rel="noreferrer">Read Nintendo’s guide ↗</a>
    <p><small>{card.sourceReview?.gameVersion} · Source checked {card.sourceReview?.checkedOn}</small></p>
  </article>;
}

export function LearningFeedback({ id }: { id: string }) {
  if (!LEARNING_QUESTIONS.some(item => item.id === id)) return null;
  return <details className="learning-feedback"><summary>Open Learning Zone card</summary><LearningCard id={id} /></details>;
}

export default function LearningCards() {
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('all');
  const query = search.trim().toLocaleLowerCase();
  const cards = LEARNING_QUESTIONS.filter(card => (topic === 'all' || card.topic === topic)
    && [card.prompt, card.answer, card.explanation, card.funFact].join(' ').toLocaleLowerCase().includes(query));
  return <section aria-label="Reviewed learning cards">
    <h2>Discover more</h2>
    <p>Explore characters, abilities and courses. These {LEARNING_QUESTIONS.length} cards use source-checked quiz facts; more guides will follow.</p>
    <label>Search learning cards <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Try Cappy, train or Bowser" /></label>
    <label>Learning topic <select value={topic} onChange={event => setTopic(event.target.value)}><option value="all">All topics</option><option value="mario">Mario adventures</option><option value="kart">Mario Kart</option></select></label>
    <p role="status">{cards.length} {cards.length === 1 ? 'card' : 'cards'} found</p>
    {cards.length ? <div className="learning-topic-grid">{cards.map(card => <LearningCard key={card.id} id={card.id} />)}</div> : <p>No matching cards yet. Try another word or choose All topics.</p>}
  </section>;
}
