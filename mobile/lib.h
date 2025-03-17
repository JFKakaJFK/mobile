#ifndef LIB_H
#define LIB_H
#include <Arduino.h>

bool feq(float a, float b);
bool fneq(float a, float b);

template<class T>
constexpr const T& clamp( const T& v, const T& lo, const T& hi );

struct cHSV;
struct cRGB
{
  uint8_t r;
  uint8_t g;
  uint8_t b;

  cRGB(uint8_t r, uint8_t g, uint8_t b): r(r), g(g), b(b) {}
  // allow constructing cRGB structs from a single number eg 0xFF00FF
  cRGB(uint32_t c = 0):
    r((c >> 16) & 0xFF),
    g((c >> 8) & 0xFF),
    b(c & 0xFF)
  {}

  bool operator==(const cRGB &other);
  bool operator!=(const cRGB &other);
  
  cHSV toHSV();
  cRGB fadeTo(cRGB &other, float progress);
};

struct cHSV
{
  float h;
  float s;
  float v;

  cHSV(float h, float s, float v): h(h), s(s), v(v) {}

  cHSV operator*(const float f);
  cHSV operator+(const cHSV &other);

  bool operator==(const cHSV &other);
  bool operator!=(const cHSV &other);

  cRGB toRGB();
};

#endif /* LIB_H */
