/**
 * Unit Tests - JWT Utils
 * 
 * Tests para funciones de JWT
 */

const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader
} = require('../../utils/jwt');

describe('JWT Utils', () => {
  const testPayload = {
    id: '123456789',
    email: 'test@example.com',
    role: 'user'
  };

  describe('generateAccessToken', () => {
    test('should generate a valid access token', () => {
      const token = generateAccessToken(testPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    test('should include payload data in token', () => {
      const token = generateAccessToken(testPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded.id).toBe(testPayload.id);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.role).toBe(testPayload.role);
    });

    test('should have exp claim', () => {
      const token = generateAccessToken(testPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded.exp).toBeDefined();
      expect(typeof decoded.exp).toBe('number');
    });
  });

  describe('generateRefreshToken', () => {
    test('should generate a valid refresh token', () => {
      const token = generateRefreshToken(testPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    test('should be different from access token', () => {
      const accessToken = generateAccessToken(testPayload);
      const refreshToken = generateRefreshToken(testPayload);

      expect(refreshToken).not.toBe(accessToken);
    });
  });

  describe('verifyAccessToken', () => {
    test('should verify valid token', () => {
      const token = generateAccessToken(testPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(testPayload.id);
    });

    test('should throw error for invalid token', () => {
      expect(() => {
        verifyAccessToken('invalid.token.here');
      }).toThrow();
    });

    test('should throw error for expired token', () => {
      // Create token with -1 second expiry (immediately expired)
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        testPayload,
        process.env.JWT_SECRET,
        { expiresIn: '-1s' }
      );

      expect(() => {
        verifyAccessToken(expiredToken);
      }).toThrow();
    });

    test('should throw error for tampered token', () => {
      const token = generateAccessToken(testPayload);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';

      expect(() => {
        verifyAccessToken(tamperedToken);
      }).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    test('should verify valid refresh token', () => {
      const token = generateRefreshToken(testPayload);
      const decoded = verifyRefreshToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(testPayload.id);
    });

    test('should throw error for invalid refresh token', () => {
      expect(() => {
        verifyRefreshToken('invalid.token.here');
      }).toThrow();
    });
  });

  describe('extractTokenFromHeader', () => {
    test('should extract token from Bearer header', () => {
      const token = 'my-jwt-token-here';
      const header = `Bearer ${token}`;

      const extracted = extractTokenFromHeader(header);
      expect(extracted).toBe(token);
    });

    test('should return null for missing header', () => {
      const extracted = extractTokenFromHeader(undefined);
      expect(extracted).toBeNull();
    });

    test('should return null for empty header', () => {
      const extracted = extractTokenFromHeader('');
      expect(extracted).toBeNull();
    });

    test('should return null for header without Bearer', () => {
      const extracted = extractTokenFromHeader('my-jwt-token-here');
      expect(extracted).toBeNull();
    });

    test('should handle case-insensitive Bearer', () => {
      const token = 'my-jwt-token-here';
      
      expect(extractTokenFromHeader(`Bearer ${token}`)).toBe(token);
      expect(extractTokenFromHeader(`bearer ${token}`)).toBe(token);
      expect(extractTokenFromHeader(`BEARER ${token}`)).toBe(token);
    });

    test('should handle extra whitespace', () => {
      const token = 'my-jwt-token-here';
      const header = `Bearer   ${token}`;

      const extracted = extractTokenFromHeader(header);
      expect(extracted).toBe(token);
    });
  });

  describe('Token Lifecycle', () => {
    test('should generate, verify, and decode token correctly', () => {
      const payload = {
        id: '999',
        email: 'lifecycle@test.com',
        role: 'admin'
      };

      // Generate
      const token = generateAccessToken(payload);
      expect(token).toBeDefined();

      // Verify
      const decoded = verifyAccessToken(token);
      expect(decoded).toBeDefined();

      // Check payload
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });
  });

  describe('Security', () => {
    test('should use different secrets for access and refresh tokens', () => {
      // Esto es verificable solo si tenemos acceso a las secrets,
      // pero podemos verificar que no son intercambiables
      const accessToken = generateAccessToken(testPayload);
      
      expect(() => {
        verifyRefreshToken(accessToken);
      }).toThrow();
    });

    test('tokens should be unique even with same payload', () => {
      const token1 = generateAccessToken(testPayload);
      const token2 = generateAccessToken(testPayload);

      // Los tokens son diferentes debido a iat (issued at) timestamp
      expect(token1).not.toBe(token2);
    });
  });
});
