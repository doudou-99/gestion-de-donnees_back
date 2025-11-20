import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT,
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'openid',
      ],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const {name, emails} = profile
    console.log('=== DEBUG PROFILE ===');
    console.log('profile.emails:', profile.email);
    console.log('profile._json:', profile._json);
    console.log('profile complet:', JSON.stringify(profile, null, 2));
    const user = {
      email: profile.email,
      firstName: name.givenName,
      lastName: name.familyName,
      accessToken,
    };
    done(null, user);
  }
}
