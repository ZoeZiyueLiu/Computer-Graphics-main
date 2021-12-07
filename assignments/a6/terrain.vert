#version 330 core

// Add parts 1a-c first, then implement part 2a

layout (std140) uniform camera
{
	mat4 projection;
	mat4 view;
	mat4 pvm;
	mat4 ortho;
	vec4 position;
};

///////////// Part 1a /////////////////////
/* Create a function that takes in an xy coordinate and returns a 'random' 2d vector. (There is no right answer)
   Feel free to find a hash function online. Use the commented function to check your result */
vec2 hash2(vec2 v)
{
	vec2 rand = vec2(0,0);
	
	// Your implementation starts here
	
	//rand  = 50.0 * 1.05 * fract(v * 0.3183099 + vec2(0.71, 0.113));
    //rand = -1.0 + 2 * 1.05 * fract(rand.x * rand.y * (rand.x + rand.y) * rand);

	// Your implementation ends here
	rand=vec2(dot(v,vec2(127.1,311.7)),
			  dot(v,vec2(269.5,183.1)));
	rand=-1.f+2.f*fract(sin(rand)*43758.5453123);

	return rand;
}

///////////// Part 1b /////////////////////
/*  Using i, f, and m, compute the perlin noise at point v */
float perlin_noise(vec2 v,int scale) 
{
	float noise = 0;
	// Your implementation starts here
	//int scale=2;
	vec2 i=vec2(int(floor(v.x)/scale)*scale,int(floor(v.y)/scale)*scale);
	//vec2 f=vec2((fract(v.x)+mod(v.x,scale))/scale,(fract(v.y)+mod(v.y,scale))/scale);
	vec2 f=vec2(mod(v.x,scale)/scale,mod(v.y,scale)/scale);
	vec2 m=f*f*(3.f-2.f*f);

	
	float g0=dot(v-i,hash2(i))/scale;
	float g1=dot(v-(i+vec2(float(scale),0.f)),hash2(i+vec2(float(scale),0.f)))/scale;
	float g2=dot(v-(i+vec2(0.f,float(scale))),hash2(i+vec2(0.f,float(scale))))/scale;
	float g3=dot(v-(i+vec2(float(scale),float(scale))),hash2(i+vec2(float(scale),float(scale))))/scale;

	noise=mix(mix(g0,g1,m.x),mix(g2,g3,m.x),m.y);
	// Your implementation ends here
	return noise;
}

///////////// Part 1c /////////////////////
/*  Given a point v and an int num, compute the perlin noise octave for point v with octave num
	num will be greater than 0 */
float noiseOctave(vec2 v, int num, int scale)
{
	float sum = 0;
	// Your implementation starts here
	for(int i=0;i<num;i++){
		sum+=pow(2.,-i)*perlin_noise(pow(2.,i)*v,scale);
	}

	// Your implementation ends here
	return sum;
}

float height(vec2 v){
    float h = 0;
	// Your implementation starts here

	//h=pow((v.x-12.5+1-pow((v.y-12.5),2)/(12.5*12.5))/5,2);

	//////////////base mountain and river////////////////////
	//h=pow((v.x-12.5+2*sin(log(1+v.y)))/5,2);
	h=pow((v.x-12.5+2*sin(pow(0.1*v.y,1.8)))/5,2);
	//h=pow((v.x-12.5+2*sin(v.y))/5,2);

	//h=min(pow((v.x-12.5)/5,2),5*pow((v.x-12.5)/5,2)-0.1);
	//if(v.x<=12.5){
	//	h+=min(h,1)*sin(1.2*v.y)/2;
	//}
	//else{
		//h+=min(h,1)*sin(v.y/1.5)/2;
	//	h+=min(h,1)*sin(1.2/(v.x-11.5)*v.y)/2;
	//}

	///////////up and downs on the sides//////////////
	//h+=min(h,1)*sin((25-min(v.x,20))/15*v.y)/2;
	//h+=min(h,1)*sin((25-max(min(v.x,20),5))/20*v.y)/2;
	//h+=min(h,1)*sin(v.y/20)/2;
	//h+=min(h,1)*sin(log(1+v.y)/3)/2;


	////////////more/less bumpy////////////////
	if(h>0.5){
		h+=noiseOctave(v,1,2);
	}
	else{
		h+=pow(h/0.5,3)*noiseOctave(v,1,2);
	}

	//if(h>0.2){
		h+=0.1*noiseOctave(v,3,1);
	//}
	
	// Your implementation ends here
	return h;
}

/*uniform variables*/
uniform float iTime;					////time

/*input variables*/
layout (location=0) in vec4 pos;
layout (location=2) in vec4 normal;
layout (location=3) in vec4 uv;
layout (location=4) in vec4 tangent;

/*output variables*/
out vec3 vtx_pos;		////vertex position in the world space

void main()												
{
	vtx_pos = (vec4(pos.xy, height(pos.xy), 1)).xyz;
	gl_Position = pvm * vec4(vtx_pos,1);
}