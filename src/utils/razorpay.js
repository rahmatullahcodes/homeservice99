let scriptLoadingPromise = null;

function loadRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay is only available in browser"));
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout script"));
    document.body.appendChild(script);
  });

  return scriptLoadingPromise;
}

export async function openRazorpayCheckout(options) {
  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Razorpay SDK not available"));
      return;
    }

    const razorpay = new window.Razorpay({
      ...options,
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled by user")),
        ...(options.modal || {})
      }
    });

    razorpay.on("payment.failed", (response) => {
      const description = response?.error?.description || "Payment failed";
      reject(new Error(description));
    });

    razorpay.open();
  });
}
