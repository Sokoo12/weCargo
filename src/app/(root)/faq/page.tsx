// src/app/faq/page.tsx
import ConstellationAnimation from "@/components/ConstellationAnimation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import Image from "next/image";

// Static FAQ data
const faqs = [
  {
    id: 1,
    question: "Би захиалгаа хэрхэн хянах вэ?",
    answer:
      'Та өөрийн данс руу нэвтэрч, "Захиалга хянах" хуудас руу орж захиалгаа хянах боломжтой.',
  },
  {
    id: 2,
    question: "Та ямар төлбөрийн аргуудыг хүлээн авдаг вэ?",
    answer:
      "Бид кредит/дебит карт, PayPal, банкны шилжүүлэг зэргийг хүлээн авдаг.",
  },
  {
    id: 3,
    question: "Би бүтээгдэхүүнийг хэрхэн буцаах вэ?",
    answer:
      "Бүтээгдэхүүн буцаахын тулд дэмжлэгийн багтай холбоо барина уу, тэд танд процессоор хөтлөх болно.",
  },
  {
    id: 4,
    question: "Таны буцаах бодлого юу вэ?",
    answer:
      "Бид ашиглагдаагүй, нээгдээгүй бүтээгдэхүүнд 30 хоногийн буцаах бодлого санал болгодог.",
  },
  {
    id: 5,
    question: "Та олон улсын хүргэлт санал болдог уу?",
    answer:
      "Тийм ээ, бид дэлхийн ихэнх оронд хүргэлт хийдэг. Хүргэлтийн зардал, хүргэх хугацаа өөр өөр байж болно.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white py-12 pb-[100px] sm:pb-0 pt-[100px]">
      <ConstellationAnimation />
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-primary">
            Заавар сургалт
          </h1>
          <Card className="p-6 rounded-lg border-primary/20 border-[5px] bg-white/90 backdrop-blur-sm">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                  <AccordionTrigger className="text-left hover:no-underline py-4 hover:bg-gray-50 rounded-lg px-4 transition-colors">
                    <span className="font-semibold text-lg text-gray-800">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 px-4 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {/* <Image
              alt="truck"
              width={400}
              height={400}
              className="object-contain mx-auto"
              src={"/assets/images/asia.png"}
            /> */}
          </Card>
        </div>
      </div>
    </div>
  );
}
