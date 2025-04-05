import redis from "../config/redis";
import { getDocument } from "pdfjs-dist";
import { GoogleGenerativeAI } from "@google/generative-ai";

const AI_MODEL = "gemini-2.5-pro-exp-03-25";
const genAI = new GoogleGenerativeAI("AIzaSyCEebEqoE_w5or8A8kj01_eDnI3R7uDx1A");
const aiModel = genAI.getGenerativeModel({ model: AI_MODEL });

export const extractTextFromPDF = async (fileKey: string) => {
  try {
    const fileData = await redis.get(fileKey);
    if (!fileData) {
      throw new Error("File not found");
    }

    let fileBuffer: Uint8Array;
    if (Buffer.isBuffer(fileData)) {
      fileBuffer = new Uint8Array(fileData);
    } else if (typeof fileData === "object" && fileData !== null) {
      // check if the the object has the expected structure
      const bufferData = fileData as { type?: string; data?: number[] };
      if (bufferData.type === "Buffer" && Array.isArray(bufferData.data)) {
        fileBuffer = new Uint8Array(bufferData.data);
      } else {
        throw new Error("Invalid file data");
      }
    } else {
      throw new Error("Invalid file data");
    }

    const pdf = await getDocument({ data: fileBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return text;
  } catch (error) {
    console.log(error);
    throw new Error(
      `Failed to extract text from PDF. Error: ${JSON.stringify(error)}`
    );
  }
};

export const detectContractType = async (
  contractText: string
): Promise<string> => {
  const prompt = `
  Analyze the following contract text snippet and determine the most specific and accurate type of contract or legal agreement it represents.
  
  Consider a wide range of possibilities, including (but not limited to) common examples like:
  
  *   **Employment & HR:** Employment Agreement, Independent Contractor Agreement, Consulting Agreement, Offer Letter, Non-Compete Agreement, Non-Solicitation Agreement, Confidentiality Agreement (NDA), Severance Agreement, Employee Handbook (if presented as binding terms)
  *   **Business & Commercial:** Master Service Agreement (MSA), Service Agreement, Statement of Work (SOW), Partnership Agreement, Joint Venture Agreement, Franchise Agreement, Distribution Agreement, Reseller Agreement, Supply Agreement, Agency Agreement, Referral Agreement, Sponsorship Agreement, Memorandum of Understanding (MOU), Letter of Intent (LOI) (note if binding or non-binding if possible)
  *   **Sales & Goods:** Sales Contract, Purchase Agreement, Bill of Sale, Purchase Order (if detailed terms make it a contract), Consignment Agreement, Warranty Agreement
  *   **Real Estate:** Lease Agreement (Residential/Commercial), Sublease Agreement, Real Estate Purchase Agreement, Option Agreement, Mortgage Agreement, Deed of Trust, Easement Agreement
  *   **Intellectual Property:** Software License Agreement (EULA/SaaS), Patent License Agreement, Trademark License Agreement, Copyright License Agreement, IP Assignment Agreement, Technology Transfer Agreement, Royalty Agreement
  *   **Financial:** Loan Agreement, Promissory Note, Security Agreement, Investment Agreement (e.g., SAFE, Convertible Note, Subscription Agreement), Shareholder Agreement, Credit Agreement, Guaranty Agreement
  *   **Web & Online:** Terms of Service (ToS), Terms and Conditions (T&C), Privacy Policy, User Agreement, Subscription Agreement, Acceptable Use Policy (AUP)
  *   **Legal & Dispute:** Settlement Agreement, Release Agreement, Arbitration Agreement, Mediation Agreement, Power of Attorney
  
  **Instructions:**
  1.  Read the provided text snippet carefully.
  2.  Identify the primary legal purpose and relationship defined by the document.
  3.  Output *only* the single, most fitting contract type name from the examples above or a similar specific legal document type.
  4.  Examples of good, concise output: "Employment Agreement", "Software License Agreement", "Lease Agreement", "Master Service Agreement", "Terms of Service", "Loan Agreement".
  5.  If the document does not appear to be a standard contract or agreement (e.g., it's an invoice, a letter, a memo, marketing material) or its specific type cannot be reasonably determined from the snippet, respond with the exact phrase: **Unknown Document Type**
  6.  **CRITICAL:** Your response must contain *only* the determined type string (or "Unknown Document Type"). Do not include *any* other words, explanations, apologies, introductory phrases (like "The contract type is:", "Based on the text..."), or formatting (like markdown, quotes, or bullet points).
    ${contractText.substring(0, 2000)}
  `;

  const results = await aiModel.generateContent(prompt);
  const response = results.response;
  return response.text().trim();
};

export const analyzeContractWithAI = async (
  contractText: string,
  tier: "free" | "premium",
  contractType: string
) => {
  let prompt;
  if (tier === "premium") {
    prompt = `
    Analyze the following ${contractType} contract and provide:
    1. A list of at least 10 potential risks for the party receiving the contract, each with a brief explanation and severity level (low, medium, high).
    2. A list of at least 10 potential opportunities or benefits for the receiving party, each with a brief explanation and impact level (low, medium, high).
    3. A comprehensive summary of the contract, including key terms and conditions.
    4. Any recommendations for improving the contract from the receiving party's perspective.
    5. A list of key clauses in the contract.
    6. An assessment of the contract's legal compliance.
    7. A list of potential negotiation points.
    8. The contract duration or term, if applicable.
    9. A summary of termination conditions, if applicable.
    10. A breakdown of any financial terms or compensation structure, if applicable.
    11. Any performance metrics or KPIs mentioned, if applicable.
    12. A summary of any specific clauses relevant to this type of contract (e.g., intellectual property for employment contracts, warranties for sales contracts).
    13. An overall score from 1 to 100, with 100 being the highest. This score represents the overall favorability of the contract based on the identified risks and opportunities.

    Format your response as a JSON object with the following structure:
    {
      "risks": [{"risk": "Risk description", "explanation": "Brief explanation", "severity": "low|medium|high"}],
      "opportunities": [{"opportunity": "Opportunity description", "explanation": "Brief explanation", "impact": "low|medium|high"}],
      "summary": "Comprehensive summary of the contract",
      "recommendations": ["Recommendation 1", "Recommendation 2", ...],
      "keyClauses": ["Clause 1", "Clause 2", ...],
      "legalCompliance": "Assessment of legal compliance",
      "negotiationPoints": ["Point 1", "Point 2", ...],
      "contractDuration": "Duration of the contract, if applicable",
      "terminationConditions": "Summary of termination conditions, if applicable",
      "overallScore": "Overall score from 1 to 100",
      "financialTerms": {
        "description": "Overview of financial terms",
        "details": ["Detail 1", "Detail 2", ...]
      },
      "performanceMetrics": ["Metric 1", "Metric 2", ...],
      "specificClauses": "Summary of clauses specific to this contract type"
    }
      `;
  } else {
    prompt = `
    Analyze the following ${contractType} contract and provide:
    1. A list of at least 5 potential risks for the party receiving the contract, each with a brief explanation and severity level (low, medium, high).
    2. A list of at least 5 potential opportunities or benefits for the receiving party, each with a brief explanation and impact level (low, medium, high).
    3. A brief summary of the contract
    4. An overall score from 1 to 100, with 100 being the highest. This score represents the overall favorability of the contract based on the identified risks and opportunities.

     {
      "risks": [{"risk": "Risk description", "explanation": "Brief explanation"}],
      "opportunities": [{"opportunity": "Opportunity description", "explanation": "Brief explanation"}],
      "summary": "Brief summary of the contract",
      "overallScore": "Overall score from 1 to 100"
    }
`;
  }

  prompt += `
    Important: Provide only the JSON object in your response, without any additional text or formatting. 
    
    
    Contract text:
    ${contractText}
    `;

  const results = await aiModel.generateContent(prompt);
  const response = await results.response;
  let text = response.text();

  // remove any markdown formatting
  text = text.replace(/```json\n?|\n?```/g, "").trim();

  try {
    // Attempt to fix common JSON errors
    text = text.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3'); // Ensure all keys are quoted
    text = text.replace(/:\s*"([^"]*)"([^,}\]])/g, ': "$1"$2'); // Ensure all string values are properly quoted
    text = text.replace(/,\s*}/g, "}"); // Remove trailing commas

    const analysis = JSON.parse(text);
    return analysis;
  } catch (error) {
    console.log("Error parsing JSON:", error);
  }

  interface IRisk {
    risk: string;
    explanation: string;
  }

  interface IOpportunity {
    opportunity: string;
    explanation: string;
  }

  interface FallbackAnalysis {
    risks: IRisk[];
    opportunities: IOpportunity[];
    summary: string;
  }

  const fallbackAnalysis: FallbackAnalysis = {
    risks: [],
    opportunities: [],
    summary: "Error analyzing contract",
  };

  // Extract risks
  const risksMatch = text.match(/"risks"\s*:\s*\[([\s\S]*?)\]/);
  if (risksMatch) {
    fallbackAnalysis.risks = risksMatch[1].split("},").map((risk) => {
      const riskMatch = risk.match(/"risk"\s*:\s*"([^"]*)"/);
      const explanationMatch = risk.match(/"explanation"\s*:\s*"([^"]*)"/);
      return {
        risk: riskMatch ? riskMatch[1] : "Unknown",
        explanation: explanationMatch ? explanationMatch[1] : "Unknown",
      };
    });
  }

  //Extact opportunities
  const opportunitiesMatch = text.match(/"opportunities"\s*:\s*\[([\s\S]*?)\]/);
  if (opportunitiesMatch) {
    fallbackAnalysis.opportunities = opportunitiesMatch[1]
      .split("},")
      .map((opportunity) => {
        const opportunityMatch = opportunity.match(
          /"opportunity"\s*:\s*"([^"]*)"/
        );
        const explanationMatch = opportunity.match(
          /"explanation"\s*:\s*"([^"]*)"/
        );
        return {
          opportunity: opportunityMatch ? opportunityMatch[1] : "Unknown",
          explanation: explanationMatch ? explanationMatch[1] : "Unknown",
        };
      });
  }

  // Extract summary
  const summaryMatch = text.match(/"summary"\s*:\s*"([^"]*)"/);
  if (summaryMatch) {
    fallbackAnalysis.summary = summaryMatch[1];
  }

  return fallbackAnalysis;
};
