// app/contact/page.tsx
"use client";
import ConstellationAnimation from "@/components/ConstellationAnimation";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const ContactPage = () => {
  const mapSrc =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d148820.0416417542!2d106.76474749999999!3d47.918002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5d96925be2b18aab%3A0x4a0b5f7e1a1a1a1a!2sUlaanbaatar%2C%20Mongolia!5e0!3m2!1sen!2smn!4v1698765432100!5m2!1sen!2smn";

  return (
    <div className="min-h-screen bg-white  py-[100px] sm:pt-[150px] ">
      <ConstellationAnimation />

      <div className="max-w-7xl mx-auto myContainer">
        <h1 className="text-3xl font-bold text-center text-primary mb-8">
          Бидэнтэй холбогдох
        </h1>

        {/* Холбоо барих мэдээлэл */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="bg-white hover:translate-y-[-10px] duration-150 border-primary/20 border-[5px] p-6 rounded-lg flex items-center space-x-4 z-10">
            <Mail className="w-10 h-10 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-gray-700">Имэйл</h2>
              <p className="text-gray-600">info@example.com</p>
            </div>
          </div>

          <div className="bg-white hover:translate-y-[-10px] duration-150 p-6 rounded-lg border-primary/20 border-[5px] flex items-center space-x-4 z-10">
            <Phone className="w-10 h-10 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-gray-700">Утас</h2>
              <p className="text-gray-600">+976 1234 5678</p>
            </div>
          </div>

          <div className="bg-white hover:translate-y-[-10px] duration-150 p-6 rounded-lg border-primary/20 border-[5px] flex items-center space-x-4 z-10">
            <MapPin className="w-10 h-10 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-gray-700">Хаяг</h2>
              <p className="text-gray-600">Улаанбаатар, Монгол</p>
            </div>
          </div>

          <div className="bg-white hover:translate-y-[-10px] duration-150 p-6 rounded-lg border-primary/20 border-[5px] flex items-center space-x-4 z-10">
            <Clock className="w-10 h-10 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-gray-700">Ажлын цаг</h2>
              <p className="text-gray-600">Даваа - Баасан: 09:00 - 18:00</p>
            </div>
          </div>
        </div>

        {/* Google Map (Iframe) */}
        <div className="bg-white relative rounded-lg border border-gray-300 overflow-hidden mb-12 z-20">
          <iframe
            src={mapSrc}
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div>
          <p></p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
