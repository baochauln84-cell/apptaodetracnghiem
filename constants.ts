
import { Question } from './types';

export const MOCK_QUESTIONS: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'timesUsed'>[] = [
  { 
    capHoc: "THPT", monHoc: "Toán", lop: "10", chuDe: "Đại số", 
    chuanKTKN: "Định lý Vi-et", mucDo: "TH", dangCau: "TracNghiem", 
    noiDung: "Cho phương trình bậc hai \\( ax^2 + bx + c = 0 \\) có hai nghiệm \\( x_1, x_2 \\). Tổng hai nghiệm được tính bởi công thức nào?", 
    luaChon: {A: "\\( x_1 + x_2 = -\\frac{b}{a} \\)", B: "\\( x_1 + x_2 = \\frac{b}{a} \\)", C: "\\( x_1 + x_2 = \\frac{c}{a} \\)", D: "\\( x_1 + x_2 = -\\frac{c}{a} \\)"}, 
    dapAn: "A", giaiThichCham: "Theo định lý Vi-et trong SGK Toán 10.", diem: 0.25, tags: ["Toán"] 
  },
  { 
    capHoc: "THPT", monHoc: "Hóa học", lop: "10", chuDe: "Phản ứng hóa học", 
    chuanKTKN: "Nhiệt phân", mucDo: "NB", dangCau: "TracNghiem", 
    noiDung: "Sản phẩm của phản ứng nhiệt phân Canxi cacbonat là gì? \\[ \\ce{CaCO3 ->[t^o] CaO + CO2} \\]", 
    luaChon: {A: "\\ce{CaO} và \\ce{CO2}", B: "\\ce{Ca} và \\ce{CO2}", C: "\\ce{CaO} và \\ce{CO}", D: "\\ce{Ca(OH)2}"}, 
    dapAn: "A", giaiThichCham: "Phản ứng phân hủy đá vôi tạo ra vôi sống và khí carbonic.", diem: 0.25, tags: ["Hóa"] 
  },
  { 
    capHoc: "THCS", monHoc: "Toán", lop: "9", chuDe: "Hình học", 
    chuanKTKN: "Tam giác vuông", mucDo: "TH", dangCau: "TracNghiem", 
    noiDung: "Tính độ dài cạnh huyền trong tam giác vuông dưới đây: [FIGURE type=\"svg\"] <svg viewBox=\"0 0 200 120\" xmlns=\"http://www.w3.org/2000/svg\"> <path d=\"M 40 100 L 160 100 L 40 20 Z\" fill=\"none\" stroke=\"black\" stroke-width=\"2\" /> <rect x=\"40\" y=\"90\" width=\"10\" height=\"10\" fill=\"none\" stroke=\"black\" /> <text x=\"30\" y=\"115\" font-family=\"serif\">A</text> <text x=\"165\" y=\"115\" font-family=\"serif\">C</text> <text x=\"30\" y=\"20\" font-family=\"serif\">B</text> <text x=\"20\" y=\"65\" font-family=\"serif\">3</text> <text x=\"100\" y=\"115\" font-family=\"serif\">4</text> </svg> [/FIGURE]", 
    luaChon: {A: "\\( 5 \\)", B: "\\( 7 \\)", C: "\\( \\sqrt{7} \\)", D: "\\( 25 \\)"}, 
    dapAn: "A", giaiThichCham: "Dùng Pytago: \\( BC = \\sqrt{3^2 + 4^2} = 5 \\).", diem: 0.25, tags: ["Toán", "Pytago"] 
  },
  { 
    capHoc: "THPT", monHoc: "Vật lý", lop: "11", chuDe: "Điện học", 
    chuanKTKN: "Định luật Ohm", mucDo: "NB", dangCau: "TuLuan", 
    noiDung: "Phát biểu và viết biểu thức của Định luật Ohm cho đoạn mạch chỉ chứa điện trở \\( R \\).", 
    luaChon: {}, 
    dapAn: "Biểu thức: \\( I = \\frac{U}{R} \\)", 
    giaiThichCham: "Cường độ dòng điện tỉ lệ thuận với hiệu điện thế và tỉ lệ nghịch với điện trở.", diem: 2.0, tags: ["Lý"] 
  }
];

export const CAP_HOC_OPTIONS = [
  { value: "TieuHoc", label: "Tiểu học" },
  { value: "THCS", label: "THCS" },
  { value: "THPT", label: "THPT" }
];

export const MUC_DO_OPTIONS = [
  { value: "NB", label: "Nhận biết" },
  { value: "TH", label: "Thông hiểu" },
  { value: "VD", label: "Vận dụng" },
  { value: "VDC", label: "Vận dụng cao" }
];

export const DANG_CAU_OPTIONS = [
  { value: "TracNghiem", label: "Trắc nghiệm" },
  { value: "TuLuan", label: "Tự luận" }
];
