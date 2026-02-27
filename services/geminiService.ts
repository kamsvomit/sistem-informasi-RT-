
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// IMPORTANT: In a real environment, verify process.env.API_KEY is available.
// For this generated code, we assume it is injected.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateLetterDraft = async (
  recipient: string,
  purpose: string,
  residentName: string,
  residentNik: string
): Promise<string> => {
  try {
    const prompt = `
      Buatkan surat pengantar resmi RT.
      Konteks: RT 06 RW 19 Desa Rancamanyar, Kecamatan Baleendah, Kabupaten Bandung.
      Nama Warga: ${residentName}
      NIK: ${residentNik}
      Tujuan Surat: ${recipient}
      Keperluan: ${purpose}
      
      Buat dengan format resmi, bahasa baku, sopan, dan rapi. 
      Sertakan tempat untuk tanda tangan Ketua RT.
      Hanya berikan teks suratnya saja.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Gagal menghasilkan draf surat.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Maaf, terjadi kesalahan saat menghubungi asisten AI. Pastikan API Key valid.";
  }
};

export const askRTAssistant = async (question: string, contextData: string): Promise<string> => {
  try {
    const prompt = `
      Anda adalah Asisten Virtual Cerdas untuk Ketua RT 06 RW 19 Desa Rancamanyar.
      Tugas anda adalah membantu administrasi, membuat pengumuman, dan menjawab pertanyaan operasional.
      
      Data Konteks (Ringkasan): ${contextData}
      
      Pertanyaan User: ${question}
      
      Jawab dengan ringkas, sopan, dan membantu. Jika diminta membuat pengumuman WhatsApp, gunakan emoji agar menarik.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Tidak ada respon.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Maaf, asisten sedang tidak dapat dihubungi.";
  }
};

export const getRegionZipCode = async (kelurahan: string, kecamatan: string, kota: string): Promise<string> => {
  try {
    if (!kelurahan || !kecamatan || !kota) return "";
    
    const prompt = `
      Carikan KODE POS untuk wilayah berikut di Indonesia:
      Kelurahan/Desa: ${kelurahan}
      Kecamatan: ${kecamatan}
      Kota/Kabupaten: ${kota}
      
      Hanya berikan SATU angka kode pos yang paling akurat (5 digit). Jangan ada teks lain.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const text = response.text?.trim() || "";
    // Extract digits only
    const zipCode = text.replace(/[^0-9]/g, '').slice(0, 5);
    return zipCode;
  } catch (error) {
    console.error("Gemini Zip Code Error:", error);
    return "";
  }
};

export const extractKTPData = async (base64Image: string): Promise<any> => {
  try {
    // Remove data URL prefix if present
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    const prompt = `
      Analisis gambar KTP Indonesia ini dan ekstrak datanya ke dalam format JSON.
      
      Kembalikan HANYA objek JSON valid dengan struktur berikut (tanpa markdown):
      {
        "nik": "string (angka saja)",
        "nama": "string (nama lengkap)",
        "tempatLahir": "string",
        "tanggalLahir": "string (format YYYY-MM-DD)",
        "jenisKelamin": "string (LAKI-LAKI / PEREMPUAN)",
        "alamat": "string (nama jalan/gang)",
        "rt": "string (angka, 3 digit, contoh: 005)",
        "rw": "string (angka, 3 digit, contoh: 012)",
        "kelurahan": "string",
        "kecamatan": "string",
        "kota": "string",
        "agama": "string",
        "statusPerkawinan": "string",
        "pekerjaan": "string"
      }
      
      Jika ada field yang tidak terbaca atau buram, biarkan string kosong.
      Pastikan format tanggal lahir dikonversi ke YYYY-MM-DD.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest',
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data
            }
          }
        ]
      }
    });

    const text = response.text?.trim() || "{}";
    // Clean up potential markdown code blocks
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini KTP Extraction Error:", error);
    return null;
  }
};
