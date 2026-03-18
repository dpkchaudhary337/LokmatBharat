"use client";

import React from "react";

type LazyImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

const LazyImage = React.forwardRef<HTMLImageElement, LazyImageProps>(
  (
    {
      fallbackSrc = "/assets/images/no-image.png",
      loading = "lazy",
      decoding = "async",
      src,
      ...rest
    },
    ref
  ) => {
    const resolvedSrc =
      typeof src === "string" && src.trim().length > 0 ? src : fallbackSrc;

    return (
      <img
        {...rest}
        ref={ref}
        src={resolvedSrc}
        loading={loading}
        decoding={decoding}
      />
    );
  }
);

LazyImage.displayName = "LazyImage";

export default React.memo(LazyImage);

