# Questions for the ICS API Call

## Strategy
You want to sound like you already know their system. You do. Use the technical language: WashConnect, CAGE API, Auto Passport, Codax mapping, Auto Sentry, Tunnel Master WBC. Drop specifics. They'll take you more seriously.

---

## Opening (Establish Credibility)

> "We're building a customer-facing mobile app for [car wash name] that integrates with their WashConnect setup. We've reviewed the WebHelp documentation and understand the data model — customer management, club services, fleet accounts, the promotion engine. We need to discuss API access for third-party integration."

---

## API Access & Pricing Questions

1. **"What exactly is included in the API access fee? Is it a one-time fee, annual license, or per-site?"**
   - Get clarity on the $10K — is it per integration, per site, per year?

2. **"We know you waived the API fee for Rinsed through your partnership program. Is there a similar partner program for mobile app developers building customer-facing solutions?"**
   - This shows you know about the Rinsed deal. Puts pressure on them.

3. **"Does the API fee include a sandbox/test environment, or is that additional?"**
   - You need a test environment to develop against.

4. **"Is there a reduced fee for a development/pilot period? We'd need 3-6 months of development before going live."**
   - Get free or reduced access during development.

5. **"If we bring multiple car wash operators onto the platform, does the fee scale per site or is it a blanket agreement?"**
   - Understand the economics of scaling.

---

## Technical Architecture Questions

6. **"Is the API RESTful or SOAP? What data format — JSON or XML?"**
   - Critical for development planning.

7. **"What authentication method does the API use? OAuth 2.0, API keys, JWT tokens?"**
   - Need to know for security architecture.

8. **"Are there rate limits on the API? What's the typical request volume supported?"**
   - Important for real-time features.

9. **"Does the API support webhooks or push notifications, or is it polling-only?"**
   - Webhooks = real-time. Polling = delays and more API calls.

10. **"What's the base URL structure? We noticed WashConnect uses `hosting1.washconnect.com/MyEco[SiteID]/` — does the API follow a similar pattern?"**
    - Shows you've been looking at their infrastructure.

---

## Data Access Questions

11. **"Which customer data fields are accessible via API? We need: name, email, phone, vehicle info (plate + VIN), membership status, visit history, and club tier."**
    - Pin down exactly what data you can get.

12. **"Can we create and manage club memberships via API? Specifically: enrollment, proration, renewal, suspension, termination, and auto-billing setup?"**
    - Core functionality for a loyalty app.

13. **"Can we initiate wash codes or Codax codes via the API? We want customers to purchase in-app and get a code to enter at the Auto Sentry."**
    - This is the key to bypassing the terminal for purchases.

14. **"Can we access or trigger the Auto Passport LPR system via API? We want to link license plates to app accounts for contactless identification."**
    - LPR integration would be ideal for seamless experience.

15. **"Is transaction history available in real-time, or is there a sync delay?"**
    - Real-time is important for loyalty point accrual.

---

## Integration Scope Questions

16. **"We saw that Flower Press Interactive built the Brown Bear Wash Club app using your API and needed additional endpoints added. What's the process for requesting new API endpoints if we need something not currently available?"**
    - Shows you know about Flower Press. Establishes you're serious.

17. **"How does the WashNOW app communicate with WashConnect? Does it use the same API that third-party developers get access to, or a separate internal API?"**
    - If it's the same API, you can reverse-engineer capabilities by studying WashNOW.

18. **"We want to handle payment processing in our app via Stripe. Can the API accept external payment confirmations and map them to wash services in WashConnect?"**
    - Find out if you can bring your own payment processor.

19. **"What's the integration story for the WashConnect accounting interface? Can we pull financial data for operator dashboards?"**
    - Value-add for operators.

20. **"Does the API support the promotion engine? We want to trigger promotions like bonus points, cascade pricing, calendar triggers, and punch cards from our app."**
    - WashConnect has a sophisticated promo engine — can you use it?

---

## Operational Questions

21. **"Is there a dedicated developer support channel, or do API questions go through general technical support at 1-800-246-3469?"**
    - You want a named technical contact.

22. **"What does the onboarding process look like after we sign up? How long from API access to first successful API call?"**
    - Understand the timeline.

23. **"Is there an API version policy? How much notice do we get before breaking changes?"**
    - Stability matters for production apps.

24. **"Can you share the API documentation before we commit to the fee? We need to evaluate technical feasibility."**
    - Push for docs before payment. Reasonable ask.

25. **"Are there any IP restrictions, geographic limitations, or terms that prevent us from hosting our servers outside your network?"**
    - Ensure you can deploy wherever you want.

---

## Competitive Pressure Questions (Use Sparingly)

26. **"DRB has Beacon Mobile as a first-party solution, FlexWash includes free API access, and Washify has built-in mobile. Our app adds this capability for ICS operators who are currently behind on mobile experience. Isn't it in ICS's interest to lower the barrier for developers like us?"**
    - Only use if they're firm on the $10K. Makes the competitive case.

27. **"We're also evaluating building our own membership layer with BLE beacons and Codax codes that doesn't require API access at all. We'd prefer to integrate natively with WashConnect, but the economics have to work."**
    - Subtle threat: we'll bypass your system entirely if the price isn't right.

---

## Information to Get Before the Call Ends

- [ ] Exact API fee structure (one-time vs annual vs per-site)
- [ ] API documentation (even a summary/overview)
- [ ] Authentication method
- [ ] Data format (REST/JSON vs SOAP/XML)
- [ ] Sandbox/test environment availability
- [ ] Webhook support (yes/no)
- [ ] Named technical contact for integration questions
- [ ] Partnership program details
- [ ] Timeline from signup to first API call
- [ ] Any NDA or contractual requirements
- [ ] Whether WashNOW uses the same API
- [ ] Whether wash code generation is available via API
