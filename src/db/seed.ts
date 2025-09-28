import 'dotenv/config';
import { db } from '../lib/db';
import { decksTable, cardsTable } from './schema';

async function main() {
  console.log('Seeding database with sample data...');

  // Create a sample deck
  const [sampleDeck] = await db.insert(decksTable).values({
    title: 'Sample Vocabulary Deck',
    description: 'A sample deck for testing purposes',
    userId: 'sample_user_id', // This would normally come from Clerk
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  console.log('Sample deck created:', sampleDeck);

  // Create sample cards for the deck
  const sampleCards = [
    { front: 'Hello', back: 'Hola' },
    { front: 'Goodbye', back: 'Adiós' },
    { front: 'Thank you', back: 'Gracias' },
  ];

  for (let i = 0; i < sampleCards.length; i++) {
    const card = sampleCards[i];
    await db.insert(cardsTable).values({
      deckId: sampleDeck.id,
      front: card.front,
      back: card.back,
      order: i,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  console.log(`Created ${sampleCards.length} sample cards`);
  console.log('Database seeding completed!');
}

main().catch(console.error);
