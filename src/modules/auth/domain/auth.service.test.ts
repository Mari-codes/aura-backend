import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "./auth.service.js";
import { AppError } from "../../../shared/errors/AppError.js";

describe("AuthService", () => {
  let repo: any;
  let bcryptMock: any;
  let jwtMock: any;

  beforeEach(() => {
    vi.clearAllMocks();

    repo = {
      findByEmail: vi.fn(),
      create: vi.fn(),
    };

    bcryptMock = {
      hash: vi.fn(),
      compare: vi.fn(),
    };

    jwtMock = {
      sign: vi.fn(),
    };
  });

  it("throws 401 on invalid credentials when user not found", async () => {
    repo.findByEmail.mockResolvedValue(null);

    const service = new AuthService(repo, bcryptMock, jwtMock);
    const promise = service.login({ email: "x@aura.com", password: "wrong" });

    await expect(promise).rejects.toBeInstanceOf(AppError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
    });
  });
});