import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../config/api";
import { coerceServicesList, normalizeServiceRecord } from "../utils/serviceData";
import { ensureServiceableLocation } from "../utils/serviceAvailability";

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  
  const stateService = location.state?.service;
  const [service, setService] = useState(() =>
    stateService ? normalizeServiceRecord(stateService) : null
  );
  const [relatedServices, setRelatedServices] = useState([]);
  const [loading, setLoading] = useState(!stateService);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (stateService) {
      setService(normalizeServiceRecord(stateService));
    }
  }, [stateService]);

  useEffect(() => {
    if (!id) {
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchService = async () => {
      if (!stateService) {
        setService(null);
      }
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          API_ENDPOINTS.SERVICES.GET_BY_ID(encodeURIComponent(id)),
          { signal: controller.signal }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Service not found");
          }
          throw new Error(`Failed to load service (${response.status})`);
        }

        const payload = await response.json();
        if (!isMounted) {
          return;
        }

        setService(normalizeServiceRecord(payload));
      } catch (err) {
        if (!isMounted || err?.name === "AbortError") {
          return;
        }

        console.error("Error fetching service:", err);
        setError(err?.message || "Failed to load service");
        if (!stateService) {
          setService(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchService();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id, stateService]);

  useEffect(() => {
    if (!service?.category) {
      setRelatedServices([]);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchRelated = async () => {
      try {
        const categoryParam = encodeURIComponent(service.category);
        const baseUrl = API_ENDPOINTS.SERVICES.GET_BY_CATEGORY(categoryParam);
        const shouldUseCategoryOnly = service.category === "Plumber" || !service.subcategory;
        const relatedUrl = shouldUseCategoryOnly
          ? baseUrl
          : `${baseUrl}/subcategory/${encodeURIComponent(service.subcategory)}`;

        const response = await fetch(relatedUrl, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to load related services (${response.status})`);
        }

        const payload = await response.json();
        const serviceList = coerceServicesList(payload).map(normalizeServiceRecord);
        const currentIds = new Set(
          [service.id, service._id].filter(Boolean)
        );
        const filtered = serviceList.filter(
          (item) => !currentIds.has(item.id) && !currentIds.has(item._id)
        );

        if (isMounted) {
          setRelatedServices(filtered);
        }
      } catch (err) {
        if (!isMounted || err?.name === "AbortError") {
          return;
        }

        console.error("Error fetching related services:", err);
        setRelatedServices([]);
      }
    };

    fetchRelated();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [service?.category, service?.subcategory, service?.id]);

  if (loading && !service) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', minHeight: '100vh' }}>
        <h2 style={{ color: '#6b7280' }}>Loading service...</h2>
      </div>
    );
  }

  if (!service) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', minHeight: '100vh' }}>
        <h2 style={{ color: '#6b7280' }}>{error || "Service not found"}</h2>
        <button
          onClick={() => navigate('/services')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Go Back to Services
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!ensureServiceableLocation(addToast)) {
      return;
    }
    addToCart({
      id: service.id,
      title: service.title,
      price: service.price,
      image: service.image,
      quantity: quantity,
      category: service.category || "",
      subcategory: service.subcategory || "",
    });
    addToast(`${service.title} (Qty: ${quantity}) added to cart!`, 'success');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px 0' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#2563eb',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '0'
            }}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Service Details */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '40px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>
          {/* Service Image */}
          <div style={{
            width: '100%',
            height: '300px',
            backgroundColor: '#e5e7eb',
            overflow: 'hidden'
          }}>
            <img
              src={service.image}
              alt={service.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.objectFit = 'contain';
                e.target.style.backgroundColor = '#f3f4f6';
              }}
            />
          </div>

          {/* Service Content */}
          <div style={{ padding: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '40px' }}>
              {/* Left Column - Details */}
              <div>
                {/* Title and Rating */}
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#0f172a',
                  margin: '0 0 16px 0'
                }}>
                  {service.title}
                </h1>

                {/* Rating and Reviews */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <span style={{ color: '#fbbf24', fontSize: '18px' }}>★</span>
                  <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '16px' }}>
                    {service.rating}
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>
                    ({service.reviews} reviews)
                  </span>
                </div>

                {/* Price and Duration */}
                <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>Price</p>
                  <p style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#2563eb',
                    margin: '0 0 12px 0'
                  }}>
                    From ₹{service.price}
                  </p>
                  <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
                    ⏱ Duration: {service.duration}
                  </p>
                </div>

                {/* Features */}
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#0f172a',
                    marginBottom: '16px'
                  }}>
                    What's included
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {service.features && service.features.map((feature, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          fontSize: '14px',
                          color: '#374151'
                        }}
                      >
                        <span style={{ color: '#10b981', fontSize: '18px', marginTop: '2px' }}>✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* About Service */}
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#0f172a',
                    marginBottom: '12px'
                  }}>
                    About this service
                  </h3>
                  <p style={{
                    color: '#374151',
                    lineHeight: '1.6',
                    fontSize: '14px',
                    margin: '0'
                  }}>
                    {service.title} - Professional service with expert technicians, quality materials, and customer satisfaction guarantee. All work is insured and backed by our service quality promise.
                  </p>
                </div>
              </div>

              {/* Right Column - Booking Card */}
              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                padding: '24px',
                height: 'fit-content',
                border: '1px solid #e5e7eb',
                position: 'sticky',
                top: '20px'
              }}>
                {/* Quantity Selector */}
                <p style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  marginBottom: '12px'
                }}>
                  Quantity
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  marginBottom: '20px',
                  width: 'fit-content'
                }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '18px',
                      color: '#6b7280'
                    }}
                  >
                    −
                  </button>
                  <span style={{ minWidth: '40px', textAlign: 'center', fontSize: '16px', fontWeight: '600' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '18px',
                      color: '#6b7280'
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Total Price */}
                <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #d1d5db' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' }}>Total price</p>
                  <p style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb', margin: '0' }}>
                    ₹{service.price * quantity}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    Excluding taxes
                  </p>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginBottom: '12px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                >
                  Add to Cart
                </button>

                {/* Benefits */}
                <div style={{ borderTop: '1px solid #d1d5db', paddingTop: '20px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px',
                    fontSize: '13px',
                    color: '#374151'
                  }}>
                    <span style={{ fontSize: '18px' }}>✓</span>
                    <span>Verified & vetted professionals</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px',
                    fontSize: '13px',
                    color: '#374151'
                  }}>
                    <span style={{ fontSize: '18px' }}>✓</span>
                    <span>Matched to your needs</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '13px',
                    color: '#374151'
                  }}>
                    <span style={{ fontSize: '18px' }}>✓</span>
                    <span>Customer support at every step</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Services Section */}
        {relatedServices.length > 0 && (
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '24px'
            }}>
              Related Services
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {relatedServices.map(relService => (
                <div
                  key={relService.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Image */}
                  <div style={{
                    width: '100%',
                    height: '160px',
                    backgroundColor: '#e5e7eb',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={relService.image}
                      alt={relService.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.objectFit = 'contain';
                        e.target.style.backgroundColor = '#f3f4f6';
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div style={{ padding: '16px' }}>
                    <h3 style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#0f172a',
                      marginBottom: '8px'
                    }}>
                      {relService.title}
                    </h3>

                    {/* Rating */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                      <span style={{ color: '#fbbf24', fontSize: '14px' }}>★</span>
                      <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '13px' }}>
                        {relService.rating}
                      </span>
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>
                        ({relService.reviews})
                      </span>
                    </div>

                    {/* Price */}
                    <p style={{
                      color: '#2563eb',
                      fontWeight: '700',
                      fontSize: '16px',
                      margin: '0 0 12px 0'
                    }}>
                      From ₹{relService.price}
                    </p>

                    {/* Duration */}
                    <p style={{
                      color: '#6b7280',
                      fontSize: '12px',
                      margin: '0 0 12px 0'
                    }}>
                      {relService.duration}
                    </p>

                    {/* Buttons */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px'
                    }}>
                      <button
                        onClick={() => navigate(`/services/${relService.id}`, { state: { service: relService } })}
                        style={{
                          padding: '8px',
                          backgroundColor: 'white',
                          border: '1px solid #2563eb',
                          color: '#2563eb',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '13px',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f0f9ff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          addToCart({
                            id: relService.id,
                            title: relService.title,
                            price: relService.price,
                            image: relService.image,
                            quantity: 1,
                            category: relService.category || "",
                            subcategory: relService.subcategory || "",
                          });
                          addToast(`${relService.title} added to cart!`, 'success');
                        }}
                        style={{
                          padding: '8px',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '13px',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#1d4ed8';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#2563eb';
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
