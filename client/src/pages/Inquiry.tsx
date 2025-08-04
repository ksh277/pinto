import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock,
  Bot,
  ArrowRight
} from "lucide-react";

export default function Inquiry() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t({ ko: '고객센터', en: 'Customer Service', ja: 'カスタマーサービス', zh: '客户服务' })}
          </h1>
          <p className="text-gray-600">
            {t({ ko: '24시간 AI 챗봇과 다양한 연락 방법을 제공합니다', en: '24/7 AI chatbot and various contact methods available', ja: '24時間AIチャットボットと様々な連絡方法を提供します', zh: '提供24小时AI聊天机器人和各种联系方式' })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Chatbot Section */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-[#00C19D] to-[#00A085] text-white border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="h-6 w-6 mr-2" />
                  AI 챗봇 상담
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-white/90">
                    우측 하단의 채팅 버튼을 클릭하여 24시간 즉시 상담을 받아보세요!
                  </p>
                  <div className="bg-white/20 rounded-lg p-4">
                    <h4 className="font-medium mb-2">FAQ 자동 응답 가능:</h4>
                    <ul className="text-sm space-y-1 text-white/90">
                      <li>• 운영시간 및 상담 안내</li>
                      <li>• 배송 관련 문의</li>
                      <li>• 굿즈 제작 방법</li>
                      <li>• 결제 및 환불 정책</li>
                      <li>• 회원가입 방법</li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-center p-4 bg-white/10 rounded-lg">
                    <ArrowRight className="h-5 w-5 mr-2" />
                    <span className="text-sm">우측 하단 채팅 버튼 클릭</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-blue-500" />
                  직접 연락
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-blue-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {t({ ko: '전화 상담', en: 'Phone Support', ja: '電話サポート', zh: '电话支持' })}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">02-1234-5678</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {t({ ko: '이메일 문의', en: 'Email Inquiry', ja: 'メールでのお問い合わせ', zh: '邮件咨询' })}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">support@allthatprinting.co.kr</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {t({ ko: '상담 시간', en: 'Support Hours', ja: 'サポート時間', zh: '支持时间' })}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {t({ ko: '평일 09:00 - 18:00', en: 'Weekdays 09:00 - 18:00', ja: '平日 09:00 - 18:00', zh: '工作日 09:00 - 18:00' })}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {t({ ko: '(토요일, 일요일, 공휴일 휴무)', en: '(Closed on weekends and holidays)', ja: '(土日祝日休み)', zh: '(周末和节假日休息)' })}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t dark:border-gray-600">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    {t({ ko: '카카오톡 상담', en: 'KakaoTalk Support', ja: 'カカオトーク相談', zh: 'KakaoTalk咨询' })}
                  </h4>
                  <Button
                    variant="outline"
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 border-yellow-400"
                    onClick={() => window.open('http://pf.kakao.com/_allthatprinting', '_blank')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {t({ ko: '카카오톡 상담하기', en: 'KakaoTalk Chat', ja: 'カカオトーク相談', zh: 'KakaoTalk聊天' })}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center dark:text-white">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  {t({ ko: '문의 양식', en: 'Inquiry Form', ja: 'お問い合わせフォーム', zh: '咨询表单' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="flex items-center dark:text-white">
                        <User className="h-4 w-4 mr-2" />
                        {t({ ko: '이름', en: 'Name', ja: '名前', zh: '姓名' })} *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        placeholder={t({ ko: '성함을 입력해주세요', en: 'Enter your name', ja: 'お名前を入力してください', zh: '请输入您的姓名' })}
                        className="bg-white dark:bg-[#1a1a1a] text-black dark:text-white border dark:border-gray-600"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="flex items-center dark:text-white">
                        <Mail className="h-4 w-4 mr-2" />
                        {t({ ko: '이메일', en: 'Email', ja: 'メール', zh: '邮箱' })} *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        placeholder={t({ ko: '이메일을 입력해주세요', en: 'Enter your email', ja: 'メールを入力してください', zh: '请输入您的邮箱' })}
                        className="bg-white dark:bg-[#1a1a1a] text-black dark:text-white border dark:border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="dark:text-white">
                        <Phone className="h-4 w-4 mr-2 inline" />
                        {t({ ko: '전화번호', en: 'Phone Number', ja: '電話番号', zh: '电话号码' })}
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder={t({ ko: '전화번호를 입력해주세요', en: 'Enter your phone number', ja: '電話番号を入力してください', zh: '请输入您的电话号码' })}
                        className="bg-white dark:bg-[#1a1a1a] text-black dark:text-white border dark:border-gray-600"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category" className="dark:text-white">
                        {t({ ko: '문의 유형', en: 'Inquiry Type', ja: 'お問い合わせ種別', zh: '咨询类型' })} *
                      </Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger className="bg-white dark:bg-[#1a1a1a] text-black dark:text-white border dark:border-gray-600">
                          <SelectValue placeholder={t({ ko: '문의 유형을 선택해주세요', en: 'Select inquiry type', ja: 'お問い合わせ種別を選択', zh: '请选择咨询类型' })} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="product">{t({ ko: '제품 문의', en: 'Product Inquiry', ja: '製品のお問い合わせ', zh: '产品咨询' })}</SelectItem>
                          <SelectItem value="order">{t({ ko: '주문 문의', en: 'Order Inquiry', ja: '注文のお問い合わせ', zh: '订单咨询' })}</SelectItem>
                          <SelectItem value="design">{t({ ko: '디자인 문의', en: 'Design Inquiry', ja: 'デザインのお問い合わせ', zh: '设计咨询' })}</SelectItem>
                          <SelectItem value="technical">{t({ ko: '기술 지원', en: 'Technical Support', ja: '技術サポート', zh: '技术支持' })}</SelectItem>
                          <SelectItem value="other">{t({ ko: '기타', en: 'Other', ja: 'その他', zh: '其他' })}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject" className="dark:text-white">
                      {t({ ko: '제목', en: 'Subject', ja: '件名', zh: '主题' })} *
                    </Label>
                    <Input
                      id="subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                      placeholder={t({ ko: '문의 제목을 입력해주세요', en: 'Enter inquiry subject', ja: 'お問い合わせ件名を入力', zh: '请输入咨询主题' })}
                      className="bg-white dark:bg-[#1a1a1a] text-black dark:text-white border dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="dark:text-white">
                      {t({ ko: '문의 내용', en: 'Message', ja: 'お問い合わせ内容', zh: '咨询内容' })} *
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      rows={6}
                      placeholder={t({ ko: '문의 내용을 자세히 적어주세요', en: 'Please describe your inquiry in detail', ja: 'お問い合わせ内容を詳しく記入してください', zh: '请详细描述您的咨询内容' })}
                      className="bg-white dark:bg-[#1a1a1a] text-black dark:text-white border dark:border-gray-600"
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    <Send className="h-4 w-4 mr-2" />
                    {t({ ko: '문의하기', en: 'Send Inquiry', ja: 'お問い合わせ送信', zh: '发送咨询' })}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t({ ko: '뒤로가기', en: 'Go Back', ja: '戻る', zh: '返回' })}
          </Button>
        </div>
      </div>
    </div>
  );
}