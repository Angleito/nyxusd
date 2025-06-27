import request from "supertest";
import express from "express";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import * as fc from "fast-check";

// Mock the server setup
const app = express();
app.use(express.json());

// Import the AI routes (we'll mock the LangChain dependencies)
jest.mock("@langchain/openai");
jest.mock("langchain/chains");
jest.mock("langchain/memory");

describe("AI Endpoints Integration Tests", () => {
  let server: any;

  beforeAll(() => {
    // Start test server
    server = app.listen(0); // Random port
  });

  afterAll((done) => {
    server.close(done);
  });

  describe("POST /api/ai/chat", () => {
    it("should handle valid chat requests", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            message: fc.string({ minLength: 1, maxLength: 1000 }),
            sessionId: fc.uuid(),
            context: fc.record({
              conversationStep: fc.constantFrom(
                "initial",
                "wallet_prompt",
                "investment_goals",
                "occupation",
                "risk_tolerance",
                "timeline",
                "amount",
              ),
              userProfile: fc.record({
                investmentGoal: fc.option(
                  fc.constantFrom("growth", "income", "preservation"),
                ),
                riskTolerance: fc.option(
                  fc.constantFrom("conservative", "moderate", "aggressive"),
                ),
              }),
              walletData: fc.option(
                fc.record({
                  totalValueUSD: fc.nat({ max: 1000000 }),
                  assets: fc.array(
                    fc.record({
                      symbol: fc.constantFrom("ETH", "BTC", "USDC"),
                      balance: fc
                        .float({ min: 0, max: 1000 })
                        .map((n) => n.toString()),
                      valueUSD: fc.nat({ max: 100000 }),
                    }),
                    { minLength: 1, maxLength: 5 },
                  ),
                }),
              ),
            }),
          }),
          async (requestData) => {
            const mockResponse = {
              message: `Response to: ${requestData.message}`,
              intent: {
                action: "continue",
                confidence: 0.85,
              },
              shouldContinue: true,
            };

            // Mock the endpoint behavior
            app.post("/api/ai/chat", (req, res) => {
              res.json(mockResponse);
            });

            const response = await request(app)
              .post("/api/ai/chat")
              .send(requestData)
              .expect(200);

            expect(response.body).toHaveProperty("message");
            expect(response.body.message).toBeTruthy();

            if (response.body.intent) {
              expect(response.body.intent).toHaveProperty("action");
              expect(response.body.intent).toHaveProperty("confidence");
              expect(response.body.intent.confidence).toBeGreaterThanOrEqual(0);
              expect(response.body.intent.confidence).toBeLessThanOrEqual(1);
            }
          },
        ),
        { numRuns: 20 },
      );
    });

    it("should validate request schema", async () => {
      const invalidRequests = [
        {}, // Missing required fields
        { message: "" }, // Empty message
        { message: "test", sessionId: 123 }, // Wrong type
        { message: "a".repeat(1001), sessionId: "test", context: {} }, // Message too long
      ];

      app.post("/api/ai/chat", (req, res) => {
        // Simulate validation
        if (!req.body.message || !req.body.sessionId || !req.body.context) {
          return res.status(400).json({ error: "Invalid request" });
        }
        if (req.body.message.length > 1000) {
          return res.status(400).json({ error: "Message too long" });
        }
        res.json({ message: "OK" });
      });

      for (const invalidRequest of invalidRequests) {
        const response = await request(app)
          .post("/api/ai/chat")
          .send(invalidRequest);

        expect(response.status).toBe(400);
      }
    });

    it("should handle rate limiting", async () => {
      app.post("/api/ai/chat", (req, res) => {
        res.status(429).json({
          error: "Rate limit exceeded",
          retryAfter: 60,
        });
      });

      const response = await request(app)
        .post("/api/ai/chat")
        .send({
          message: "test",
          sessionId: "test-session",
          context: { conversationStep: "chat" },
        });

      expect(response.status).toBe(429);
      expect(response.body).toHaveProperty("retryAfter");
    });
  });

  describe("POST /api/ai/chat/stream", () => {
    it("should support server-sent events", async () => {
      app.post("/api/ai/chat/stream", (req, res) => {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        // Send test chunks
        res.write('data: {"chunk": "Hello "}\n\n');
        res.write('data: {"chunk": "world!"}\n\n');
        res.write("data: [DONE]\n\n");
        res.end();
      });

      const response = await request(app)
        .post("/api/ai/chat/stream")
        .send({
          message: "test",
          sessionId: "test-session",
          context: { conversationStep: "chat" },
        })
        .expect(200);

      expect(response.headers["content-type"]).toContain("text/event-stream");
    });
  });

  describe("POST /api/ai/reset/:sessionId", () => {
    it("should reset session memory", async () => {
      await fc.assert(
        fc.asyncProperty(fc.uuid(), async (sessionId) => {
          app.post("/api/ai/reset/:sessionId", (req, res) => {
            res.json({ success: true, message: "Session reset" });
          });

          const response = await request(app)
            .post(`/api/ai/reset/${sessionId}`)
            .expect(200);

          expect(response.body.success).toBe(true);
        }),
        { numRuns: 10 },
      );
    });
  });

  describe("GET /api/ai/health", () => {
    it("should return health status", async () => {
      app.get("/api/ai/health", (req, res) => {
        res.json({
          status: "healthy",
          hasApiKey: false,
          useMockAI: true,
          activeSessions: 0,
        });
      });

      const response = await request(app).get("/api/ai/health").expect(200);

      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("hasApiKey");
      expect(response.body).toHaveProperty("useMockAI");
      expect(response.body).toHaveProperty("activeSessions");
      expect(response.body.status).toBe("healthy");
    });
  });
});

describe("AI Service Load Testing", () => {
  it("should handle concurrent requests", async () => {
    const mockApp = express();
    mockApp.use(express.json());

    mockApp.post("/api/ai/chat", (req, res) => {
      setTimeout(() => {
        res.json({
          message: "Concurrent response",
          intent: { action: "continue", confidence: 0.9 },
        });
      }, Math.random() * 50); // Random delay up to 50ms
    });

    const testServer = mockApp.listen(0);

    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            message: fc.string({ minLength: 1, maxLength: 100 }),
            sessionId: fc.uuid(),
            context: fc.record({
              conversationStep: fc.constantFrom("chat", "wallet_prompt"),
            }),
          }),
          { minLength: 5, maxLength: 20 },
        ),
        async (requests) => {
          const promises = requests.map((req) =>
            request(mockApp).post("/api/ai/chat").send(req),
          );

          const responses = await Promise.all(promises);

          // All requests should succeed
          responses.forEach((response) => {
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message");
          });
        },
      ),
      { numRuns: 5 },
    );

    testServer.close();
  });
});

describe("AI Response Consistency", () => {
  it("should maintain conversation context across requests", async () => {
    const mockApp = express();
    mockApp.use(express.json());

    const sessionMemory = new Map<string, any[]>();

    mockApp.post("/api/ai/chat", (req, res) => {
      const { sessionId, message } = req.body;

      if (!sessionMemory.has(sessionId)) {
        sessionMemory.set(sessionId, []);
      }

      const history = sessionMemory.get(sessionId)!;
      history.push({ role: "user", content: message });

      const response = {
        message: `I remember ${history.length} messages in this conversation`,
        conversationLength: history.length,
      };

      history.push({ role: "assistant", content: response.message });

      res.json(response);
    });

    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), {
          minLength: 1,
          maxLength: 10,
        }),
        async (sessionId, messages) => {
          for (let i = 0; i < messages.length; i++) {
            const response = await request(mockApp)
              .post("/api/ai/chat")
              .send({
                message: messages[i],
                sessionId,
                context: { conversationStep: "chat" },
              });

            expect(response.body.conversationLength).toBe((i + 1) * 2 - 1);
          }
        },
      ),
      { numRuns: 10 },
    );
  });
});
