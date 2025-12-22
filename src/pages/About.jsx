import { useEffect } from "react";

export default function About() {

  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="container">

      {/* HERO */}
      <section className="reveal">
        <h1 className="section-title">About Home Service99</h1>
        <p className="about-intro">
          Home Service99 is a technology-driven home service platform connecting customers with
          trained, verified professionals for reliable home services — all at your fingertips.
        </p>
      </section>

      {/* CORE VALUES */}
      <section className="about-grid reveal">
        {[
          ["Trust & Safety", "100% background-verified professionals"],
          ["Transparent Pricing", "No hidden costs, clear estimates"],
          ["Quality Service", "Standardized process and trained experts"],
          ["Customer Support", "Real humans, real help"]
        ].map((item, i) => (
          <div key={i} className="about-card">
            <strong>{item[0]}</strong>
            <p>{item[1]}</p>
          </div>
        ))}
      </section>

      {/* STORY */}
      <section className="about-story reveal">
        <h2>Our Story</h2>
        <p>
          We started with a simple goal — to remove the hassle of finding trusted help for everyday home needs.
          From broken switches to deep cleaning, customers needed one reliable solution. That’s why Home Service99 was built.
        </p>
        <p>
          Today, we work with thousands of trained professionals across multiple cities, ensuring every booking delivers
          quality, reliability, and peace of mind.
        </p>
      </section>

      {/* METRICS */}
      <section className="about-metrics reveal">
        {[
          ["50k+", "Bookings completed"],
          ["4.8★", "Customer rating"],
          ["2000+", "Professionals onboarded"],
          ["30 min", "Avg service response"]
        ].map((m, i) => (
          <div key={i}>
            <strong>{m[0]}</strong>
            <span>{m[1]}</span>
          </div>
        ))}
      </section>

      {/* VISION */}
      <section className="about-story reveal">
        <h2>Vision</h2>
        <p>
          To be India’s most trusted platform for home services by delivering consistent quality, safety,
          and exceptional customer experience.
        </p>

        <h2>Mission</h2>
        <p>
          Make professional home services accessible, affordable, and reliable for every household.
        </p>
      </section>

      {/* TEAM */}
      <section className="about-team reveal">
        <h2>Our Team</h2>
        <div className="about-grid">
          {["Operations", "Technology", "Customer Success", "Partner Support"].map((team, i) => (
            <div key={i} className="about-card">
              <strong>{team}</strong>
              <p>Expert team focused on delivering excellence</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta reveal">
        <h2>Ready to experience hassle-free home services?</h2>
        <button className="btn-primary">
          Explore Our Services
        </button>
      </section>

    </div>
  );
}
