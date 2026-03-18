import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GameScore from '@/models/GameScore';

export async function POST(req) {
  try {
    await dbConnect();
    
    const { userId, gameSlug, score, bestScore, attempts, timestamp } = await req.json();

    if (!userId || !gameSlug || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Tìm hoặc tạo bản ghi
    let gameScore = await GameScore.findOne({ userId, gameSlug });

    if (gameScore) {
      // Cập nhật bản ghi hiện có
      gameScore.lastScore = score;
      gameScore.bestScore = Math.max(gameScore.bestScore, bestScore);
      gameScore.attempts = attempts;
      gameScore.lastAttempt = new Date(timestamp);
      gameScore.updatedAt = new Date();
    } else {
      // Tạo bản ghi mới
      gameScore = new GameScore({
        userId,
        gameSlug,
        lastScore: score,
        bestScore: bestScore,
        attempts: attempts,
        lastAttempt: new Date(timestamp),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await gameScore.save();

    return NextResponse.json(
      {
        success: true,
        data: gameScore
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving game score:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const gameSlug = searchParams.get('gameSlug');

    let query = {};
    if (userId) query.userId = userId;
    if (gameSlug) query.gameSlug = gameSlug;

    const scores = await GameScore.find(query).sort({ bestScore: -1 });

    return NextResponse.json(
      {
        success: true,
        data: scores
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching game scores:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
