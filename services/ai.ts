
import { GoogleGenAI, Type } from "@google/genai";
import { MucDo } from "../types";

// Helper để xử lý lỗi đặc thù
const handleAiError = (err: any) => {
  console.error("AI Service Error:", err);
  if (err?.message?.includes("Requested entity was not found")) {
    throw new Error("API_KEY_NOT_FOUND");
  }
  throw err;
};

export const aiService = {
  /**
   * Sinh câu hỏi mới từ Prompt
   */
  async generateQuestions(topic: string, subject: string, grade: string, count: number = 1, level?: MucDo, type: string = "TracNghiem") {
    // Comment: Khởi tạo instance mới mỗi lần gọi để đảm bảo dùng API Key mới nhất từ process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const systemInstruction = `Bạn là Chuyên gia Khảo thí STEM. Nhiệm vụ: Soạn ${count} câu hỏi môn ${subject} lớp ${grade}, chủ đề "${topic}".

    QUY TẮC ĐỊNH DẠNG (SỐNG CÒN):
    1. TOÁN HỌC: Inline dùng \\( ... \\), Block dùng \\[ ... \\]. Tuyệt đối không dùng $.
    2. HÓA HỌC: Luôn dùng \\ce{...}. Ví dụ: \\ce{Fe + CuSO4 -> FeSO4 + Cu}.
    3. HÌNH HỌC/ĐỒ THỊ: Nếu nội dung cần hình vẽ, hãy chèn mã SVG trong thẻ [FIGURE type="svg"]...[/FIGURE].
    4. CẤU TRÚC: Phải trả về JSON mảng đối tượng.`;

    try {
      // Comment: Always use ai.models.generateContent with model name and prompt directly.
      // Using gemini-3-pro-preview for complex reasoning and STEM tasks.
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Soạn ${count} câu hỏi ${type} mức độ ${level} về ${topic}.`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                noiDung: { type: Type.STRING },
                dangCau: { type: Type.STRING, enum: ["TracNghiem", "TuLuan"] },
                mucDo: { type: Type.STRING, enum: ["NB", "TH", "VD", "VDC"] },
                luaChon: { 
                  type: Type.OBJECT, 
                  properties: { 
                    A: { type: Type.STRING }, B: { type: Type.STRING }, C: { type: Type.STRING }, D: { type: Type.STRING } 
                  }
                },
                dapAn: { type: Type.STRING },
                giaiThichCham: { type: Type.STRING },
                chuanKTKN: { type: Type.STRING }
              },
              required: ["noiDung", "dangCau", "mucDo", "dapAn", "giaiThichCham", "chuanKTKN"]
            }
          }
        }
      });
      return JSON.parse(response.text || "[]");
    } catch (err) {
      return handleAiError(err);
    }
  },

  /**
   * Trích xuất câu hỏi từ tài liệu (Hình ảnh/PDF)
   */
  async extractQuestionsFromDoc(base64Data: string, mimeType: string) {
    // Comment: Ensure GoogleGenAI instance is created right before making the call.
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `Bạn là chuyên gia số hóa đề thi. Hãy trích xuất toàn bộ các câu hỏi từ tài liệu này thành định dạng JSON.
    Yêu cầu:
    1. Giữ nguyên nội dung, chuyển các công thức toán/lý/hóa sang LaTeX chuẩn (\\( ... \\) và \\ce{...}).
    2. Nếu có hình vẽ, hãy cố gắng mô tả lại bằng mã SVG đơn giản trong thẻ [FIGURE type="svg"].
    3. Phân loại mức độ (NB, TH, VD, VDC) dựa trên nội dung.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: mimeType } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                noiDung: { type: Type.STRING },
                dangCau: { type: Type.STRING, enum: ["TracNghiem", "TuLuan"] },
                mucDo: { type: Type.STRING },
                luaChon: { 
                  type: Type.OBJECT, 
                  properties: { A: { type: Type.STRING }, B: { type: Type.STRING }, C: { type: Type.STRING }, D: { type: Type.STRING } }
                },
                dapAn: { type: Type.STRING },
                giaiThichCham: { type: Type.STRING },
                chuanKTKN: { type: Type.STRING },
                monHoc: { type: Type.STRING },
                lop: { type: Type.STRING },
                chuDe: { type: Type.STRING }
              },
              required: ["noiDung", "dangCau", "dapAn"]
            }
          }
        }
      });
      return JSON.parse(response.text || "[]");
    } catch (err) {
      return handleAiError(err);
    }
  },

  async extractMatrixFromImage(base64Data: string, mimeType: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `Bạn là chuyên gia phân tích ma trận đề thi. Hãy trích xuất cấu trúc ma trận đề thi từ tài liệu/hình ảnh này thành định dạng JSON.
    Yêu cầu:
    1. Trả về mảng các đối tượng, mỗi đối tượng đại diện cho một chủ đề kiến thức.
    2. Mỗi đối tượng gồm: topic (tên chủ đề), NB (số câu nhận biết), TH (số câu thông hiểu), VD (số câu vận dụng), VDC (số câu vận dụng cao).
    3. Nếu giá trị nào không có, hãy để là 0.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: mimeType } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                topic: { type: Type.STRING },
                NB: { type: Type.NUMBER },
                TH: { type: Type.NUMBER },
                VD: { type: Type.NUMBER },
                VDC: { type: Type.NUMBER }
              },
              required: ["topic", "NB", "TH", "VD", "VDC"]
            }
          }
        }
      });
      return JSON.parse(response.text || "[]");
    } catch (err) {
      return handleAiError(err);
    }
  },

  async suggestSmartMatrix(topics: string[], totalQuestions: number, subject: string, inventoryStr: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Gợi ý ma trận ${totalQuestions} câu cho môn ${subject}. Các chủ đề: ${topics.join(', ')}. Kho hiện có: ${inventoryStr}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                topic: { type: Type.STRING },
                NB: { type: Type.NUMBER },
                TH: { type: Type.NUMBER },
                VD: { type: Type.NUMBER },
                VDC: { type: Type.NUMBER }
              },
              required: ["topic", "NB", "TH", "VD", "VDC"]
            }
          }
        }
      });
      return JSON.parse(response.text || "[]");
    } catch (err) {
      return handleAiError(err);
    }
  }
};
