import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { availability, dateOverrides } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const schedule = await db
      .select()
      .from(availability)
      .where(eq(availability.userId, user.id));

    let overrides: any[] = [];
    if (date) {
      overrides = await db
        .select()
        .from(dateOverrides)
        .where(
          and(
            eq(dateOverrides.userId, user.id),
            eq(dateOverrides.date, date)
          )
        );
    }

    return NextResponse.json({ schedule, overrides });
  } catch (error) {
    console.error('Availability fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { schedule } = body;

    if (!schedule) {
      return NextResponse.json(
        { error: 'schedule is required' },
        { status: 400 }
      );
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(availability)
        .where(eq(availability.userId, user.id));

      await tx
        .insert(availability)
        .values(
          schedule.map((item: any) => ({
            userId: user.id,
            dayOfWeek: item.dayOfWeek,
            startTime: item.startTime,
            endTime: item.endTime,
            isActive: item.enabled,
          }))
        );
    });

    const newAvailability = await db
      .select()
      .from(availability)
      .where(eq(availability.userId, user.id));

    return NextResponse.json({
      success: true,
      availability: newAvailability,
    });
  } catch (error) {
    console.error('Availability update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
