import { ShieldCheck, Truck, MessageCircle } from "lucide-react";
export const BenefitsStrip = () => (
  <section className="service-strip" aria-label="Shopping information">
    <div>
      <ShieldCheck size={22} />
      <span>
        M-Pesa checkout<small>Payment verified before fulfilment</small>
      </span>
    </div>
    <div>
      <Truck size={22} />
      <span>
        Delivery arrangements
        <small>Confirm availability and cost with us</small>
      </span>
    </div>
    <a href="https://wa.me/254718796296" target="_blank" rel="noreferrer">
      <MessageCircle size={22} />
      <span>
        A little help choosing?<small>Talk to the boutique on WhatsApp</small>
      </span>
    </a>
  </section>
);
