import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { eventTypes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '')
    .slice(0, 80);
  return base || 'event';
}

/** GET /api/event-types — host's own event types */
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const events = await db
    .select()
    .from(eventTypes)
    .where(eq(eventTypes.userId, user.id));
  return NextResponse.json({ eventTypes: events });
}

/** POST /api/event-types — create event type */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const { title, duration, description, price } = body;

  if (!title || typeof title !== 'string' || title.trim().length < 1) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }
  const dur = Number(duration);
  if (![15, 30, 45, 60, 90, 120].includes(dur)) {
    return NextResponse.json({ error: 'Invalid duration' }, { status: 400 });
  }

  const baseSlug = slugify(title);
  let slug = baseSlug;
  for (let i = 1; i < 100; i++) {
    const existing = await db
      .select({ id: eventTypes.id })
      .from(eventTypes)
      .where(and(eq(eventTypes.userId, user.id), eq(eventTypes.slug, slug)));
    if (existing.length === 0) break;
    slug = `${baseSlug}-${i}`;
  }

  const [created] = await db
    .insert(eventTypes)
    .values({
      userId: user.id,
      title: title.trim().slice(0, 255),
      slug,
      description: description ? String(description).slice(0, 2000) : undefined,
      duration: dur,
      price: price ? Math.max(0, Math.round(Number(price))) : 0,
    })
    .returning();

  return NextResponse.json({ eventType: created }, { status: 201 });
}

/** DELETE /api/event-types?id= — delete own event type */
export async function DELETE(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }
  await db
    .delete(eventTypes)
    .where(and(eq(eventTypes.id, id), eq(eventTypes.userId, user.id)));
  return NextResponse.json({ success: true });
}
