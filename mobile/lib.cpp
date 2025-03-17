#include "lib.h"

const float epsilon = .0001;
bool feq(float a, float b) {
  return fabs(a - b) < epsilon;
}

bool fneq(float a, float b) {
  return fabs(a - b) > epsilon;
}

template<class T>
constexpr const T& clamp( const T& v, const T& lo, const T& hi )
{
  return v > hi ? hi : v < lo ? lo : v;
}

bool cRGB::operator==(const cRGB &other) {
  return r == other.r && g == other.g && b == other.b;
}
bool cRGB::operator!=(const cRGB &other) {
  return r != other.r || g != other.g || b != other.b;
}

cHSV cHSV::operator*(const float f) {
  return cHSV(fmod(h * f, 360.0f), clamp(s * f, 0.0f, 1.0f), clamp(v * f, 0.0f, 1.0f));
}
cHSV cHSV::operator+(const cHSV &other) {
  return cHSV(fmod(h + other.h, 360.0f), clamp(s + other.s, 0.0f, 1.0f), clamp(v + other.v, 0.0f, 1.0f));
}
bool cHSV::operator==(const cHSV &other) {
  return feq(h, other.h) && feq(s, other.s) && feq(v, other.v);
}
bool cHSV::operator!=(const cHSV &other) {
  return fneq(h, other.h) || fneq(s, other.s) || fneq(v, other.v);
}

// see https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_RGB_alternative
cRGB cHSV::toRGB() {
  auto f = [this](float n) {
    const float k = fmod(n + h / 60.0f, 6.0f);
    return static_cast<uint8_t>(rint(255 * (v - v * s * clamp(fmin(k, 4.0f - k), 0.0f, 1.0f))));
  };

  return cRGB(f(5), f(3), f(1));
}

// see https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_RGB_alternative
cHSV cRGB::toHSV() {
  cHSV hsv(0.0f, 0.0f, 0.0f);
  const float _r = r / 255.0f;
  const float _g = g / 255.0f;
  const float _b = b / 255.0f;

  float cmax = _r > g ? _r : g;
  cmax = cmax > _b ? cmax : _b;

  if (feq(cmax, 0.0f)) return hsv;
  hsv.v = cmax;

  float cmin = _r < _g ? _r : _g;
  cmin = cmin < _b ? cmin : _b;

  float d = cmax - cmin;

  float s = d / cmax;
  if (feq(s, 0.0f)) return hsv;
  hsv.s = s;

  if (cmax <= _r)
    hsv.h = (_g - _b) / d;
  else if (cmax <= _g)
    hsv.h = 2.0f + (_b - _r) / d;
  else
    hsv.h = 4.0f + (_r - _g) / d;
  hsv.h *= 60.0f;

  return hsv;
}

// TODO make nice
cRGB cRGB::fadeTo(cRGB &other, float progress) {
  if (progress >= .999f) return other;
  cHSV from = this->toHSV();
  cHSV to = other.toHSV();
  cHSV step = from * (1.0f - progress) + to * progress;
  return step.toRGB();
}
