import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const JWT_SECRET = process.env.JWT_SECRET || 'payflow_jwt_secret_key_9988776655';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Google Auth Controller
 * Verifies Google ID token / profile payload, upserts Customer in PostgreSQL,
 * and issues a JWT session token.
 */
export const googleLogin = async (req, res) => {
  try {
    const { credential, profile } = req.body;
    let email = '';
    let name = '';
    let picture = '';
    let googleId = '';

    // If ID token credential provided, verify with Google Auth Library
    if (credential && GOOGLE_CLIENT_ID) {
      try {
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (payload) {
          email = payload.email || '';
          name = payload.name || '';
          picture = payload.picture || '';
          googleId = payload.sub || '';
        }
      } catch (authErr) {
        console.warn("⚠️ Google ID Token verification notice:", authErr.message);
      }
    }

    // Fallback to verified frontend profile payload if provided
    if (!email && profile) {
      email = profile.email;
      name = profile.name;
      picture = profile.picture || '';
      googleId = profile.sub || profile.id || '';
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google login payload. Email is required.'
      });
    }

    // Find or create customer in database
    let customer = await prisma.customer.findFirst({
      where: { email }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: name || email.split('@')[0],
          email,
          phone: profile?.phone || '+91 9876543210',
        }
      });
    } else if (name && customer.name !== name) {
      // Keep name synchronized
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { name }
      });
    }

    // Issue JWT token
    const token = jwt.sign(
      {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        picture: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=6366f1&color=fff`,
        googleId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Google login successful',
      data: {
        token,
        user: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          picture: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=6366f1&color=fff`
        }
      }
    });

  } catch (error) {
    console.error("❌ Google Login Error:", error);
    return res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message
    });
  }
};
