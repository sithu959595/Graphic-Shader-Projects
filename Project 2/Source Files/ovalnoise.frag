#version 330 compatibility

in vec3 vMCposition;
in vec4 vColor;
in float vLightIntensity;
in vec2 vST;
in float Z; 

uniform float uAd;
uniform float uBd;
uniform float uNoiseAmp;
uniform float uNoiseFreq;
uniform float uAlpha;
uniform float uTol;
uniform sampler3D Noise3;
uniform bool uUseChromaDepth;
uniform float uChromaRed;
uniform float uChromaBlue;
uniform vec4 uOvalColor;

const vec4 Orange = vec4( 1., 0., 0.5, 1 );

vec3
Rainbow( float d )
{
	d = clamp( d, 0., 1. );

	float r = 1.;
	float g = 0.0;
	float b = 1. - 6. * ( d - (5./6.) );

 if( d <= (5./6.) )
 {
 r = 6. * ( d - (4./6.) );
 g = 0.;
 b = 1.;
 }

 if( d <= (4./6.) )
 {
 r = 0.;
 g = 1. - 6. * ( d - (3./6.) );
 b = 1.;
 }

 if( d <= (3./6.) )
 {
 r = 0.;
 g = 1.;
 b = 6. * ( d - (2./6.) );
 }

 if( d <= (2./6.) )
 {
 r = 1. - 6. * ( d - (1./6.) );
 g = 1.;
 b = 0.;
 }

 if( d <= (1./6.) )
 {
 r = 1.;
 g = 6. * d;
 }

	return vec3( r, g, b );
}

void
main( )
{ 
 vec4 nv = texture3D( Noise3, uNoiseFreq * vMCposition );
	float n = nv.r + nv.g + nv.b + nv.a;//range is 1. -> 3.
	n = n - 2.;	//range is -1. -> 1.

	float s = vST.s;
	float t = vST.t;
	float sp = 2. * s;
	float tp = t;

	float Ar = uAd/2.;
	float Br = uBd/2.;

	
	int numins = int( sp / uAd );
	int numint = int( tp / uBd );

	gl_FragColor = vColor;	// default color
	float alpha = 1.; 

	float sc = float(numins)*uAd + Ar;
	float tc = float(numint)*uBd + Br;
	sp = sp - sc;
	tp = tp - tc;
  float oldDist = sqrt( sp*sp + tp*tp );
 float newDist = oldDist + uNoiseAmp * n;
 float scale = newDist/oldDist;
	sp *= scale;                            // scale by noise factor
sp /= Ar;                               // ellipse equation

tp *= scale;                            // scale by noise factor
tp /= Br;                               // ellipse equation

float d = sp*sp + tp*tp;
	if( abs( d - 1. ) <= uTol )
	{
	float j = smoothstep( 1.-uTol, 1.+uTol,d);
	gl_FragColor = mix( uOvalColor, vColor, j );
	}
	else if( d <= 1.-uTol)
	{ 
	float a = smoothstep( 1.-uTol, 1.+uTol,d );
	gl_FragColor = mix( uOvalColor, vColor, a );
//gl_FragColor =vec4(1.,0.,1.,1.);
	}
	else if(d > 1.+uTol)
	{
	alpha = uAlpha;
	gl_FragColor = vColor;
	if (uAlpha==0.){
	discard;
	}
	}
	
	if (uUseChromaDepth)
	{
	float t = (2./3.) * ( Z - uChromaRed ) / ( uChromaBlue - uChromaRed );
	t = clamp( t, 0., 2./3. );
	gl_FragColor.xyz = Rainbow( t );
	}
	gl_FragColor = vec4( vLightIntensity*gl_FragColor.xyz, alpha);
	
}