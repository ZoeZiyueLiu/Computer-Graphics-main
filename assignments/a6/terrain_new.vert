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
float perlin_noise(vec2 v) 
{
	float noise = 0;
	// Your implementation starts here
	vec2 i=floor(v);
	vec2 f=fract(v);
	vec2 m=f*f*(3.f-2.f*f);

	float g0=dot(v-i,hash2(i));
	float g1=dot(v-(i+vec2(1.f,0.f)),hash2(i+vec2(1.f,0.f)));
	float g2=dot(v-(i+vec2(0.f,1.f)),hash2(i+vec2(0.f,1.f)));
	float g3=dot(v-(i+vec2(1.f,1.f)),hash2(i+vec2(1.f,1.f)));

	noise=mix(mix(g0,g1,m.x),mix(g2,g3,m.x),m.y);
	// Your implementation ends here
	return noise;
}

///////////// Part 1c /////////////////////
/*  Given a point v and an int num, compute the perlin noise octave for point v with octave num
	num will be greater than 0 */
float noiseOctave(vec2 v, int num)
{
	float sum = 0;
	// Your implementation starts here
	for(int i=0;i<num;i++){
		sum+=pow(2.,-i)*perlin_noise(pow(2.,i)*v);
	}

	// Your implementation ends here
	return sum;
}

///////////// Part 2a /////////////////////
/* create a function that takes in a 2D point and returns a height using perlin noise 
    There is no right answer. Think about what functions will create what shapes.
    If you want steep mountains with flat tops, use a function like sqrt(noiseOctave(v,num)). 
    If you want jagged mountains, use a function like e^(noiseOctave(v,num))
    You can also add functions on top of each other and change the frequency of the noise
    by multiplying v by some value other than 1*/

float gaussian(float a,vec2 std,vec2 cp,vec2 cen){
	// return a*exp(-pow(cp.x-cen.x,2)/(2*pow(std.x,2))-pow(cp.y-cen.y,2)/(2*pow(std.y,2)));
	return a*exp(-pow(0.7*noiseOctave(cp,1)+cp.x-cen.x,2)/(2*pow(std.x,2))-pow(cp.y-cen.y,2)/(2*pow(std.y,2)));

}

float height(vec2 v){
    float h = 0;
	float gterm=0;
	float gterm_fac=0.5;
	float stdpara=1.5;
	float left=1;

	float as[8];
	as[0]=2;
	as[1]=1.2;
	as[2]=1.5;
	as[3]=1.3;
	////beach
	as[4]=0.5;
	as[5]=0.5;
	as[6]=0.5;
	as[7]=0.5;	

	vec2 stds[8];
	stds[0]=vec2(1.5,1.5)*left;
	stds[1]=vec2(2,1)*left;
	stds[2]=vec2(1,2)*left;
	stds[3]=vec2(1,1);
	////beach
	stds[4]=vec2(5,5)*stdpara*left;
	stds[5]=vec2(3,3)*stdpara*left;
	stds[6]=vec2(3,3)*stdpara*left;
	stds[7]=vec2(4.5,4.5)*stdpara;

	vec2 cens[8];
	cens[0]=vec2(1,1);
	cens[1]=vec2(3,0.8);
	cens[2]=vec2(0.5,3.5);
	cens[3]=vec2(4.1,4.1);
	////beach
	cens[4]=vec2(1.3,1.2);
	cens[5]=vec2(4,0.8);
	cens[6]=vec2(0.8,3.8);
	cens[7]=vec2(4.6,4.6);

	// Your implementation starts here
	//h=0.85*noiseOctave(2*v,5);
	vec2 tstd=vec2(1,1);
	for(int i=0;i<as.length();i++){
		// gterm+=gaussian(as[i],stds[i],v,cens[i]);
		gterm=max(gterm,gaussian(as[i],stds[i]/stdpara,v,cens[i]));
	}
	gterm=max(gterm-0.4,0.05);
	if(gterm>0.05){
		h=exp(noiseOctave(v,8))*gterm+gterm_fac*gterm;}
	else{
		// h=exp(noiseOctave(v,8))*gterm+gterm_fac*gterm;
		h=gterm_fac*gterm;
	}
	// h+=exp(noiseOctave(v+iTime,4))*gterm+gterm_fac*gterm;
	// if(h<0.5){
	// 	h*=0.1f;
	// }
	


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
out vec2 vtx_uv;
out float ch;		////vertex position in the world space

void main()												
{
	vtx_pos = (vec4(pos.xy, height(pos.xy), 1)).xyz;
	//vtx_pos=pos.xyz;
	vtx_uv=uv.xy;
	ch=height(pos.xy);
	//ch=pos.xy;
	gl_Position = pvm * vec4(vtx_pos,1);
}