#version 330 core

layout (std140) uniform camera
{
	mat4 projection;
	mat4 view;
	mat4 pvm;
	mat4 ortho;
	vec4 position;
};

/*uniform variables*/
uniform float iTime;					////time
uniform sampler2D rock_albedo;
uniform sampler2D noise_albedo;
uniform sampler2D noisebig_albedo;
uniform sampler2D test_albedo;
uniform sampler2D grass_albedo;
uniform sampler2D tree_albedo;
uniform sampler2D riverbank_albedo;
uniform sampler2D water_albedo;
//uniform sampler2D tex_normal;

/*input variables*/
in vec3 vtx_pos;
//in vec4 vtx_color;
in vec2 vtx_uv;
in float ch;

/*input variables*/
out vec4 frag_color;

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

vec2 Hash22(vec2 p)
{
	vec3 hashscale3=vec3(.1031, .1030, .0973);
	vec3 p3 = fract(vec3(p.xyx) * hashscale3);
    p3 += dot(p3, p3.yzx+19.19);
    return fract((p3.xx+p3.yz)*p3.zy);

}

vec2 Noise2(vec2 x)
{
	vec2 add = vec2(1.0, 0.0);
    vec2 p = floor(x);
    vec2 f = fract(x);
    f = f*f*(3.0-2.0*f);
    float n = p.x + p.y * 57.0;
    vec2 res = mix(mix( Hash22(p),          Hash22(p + add.xy),f.x),
                  mix( Hash22(p + add.yx), Hash22(p + add.xx),f.x),f.y);
    return res;
}


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


/////////////noise: vec3 to float/////////////////
float time = 0.0;
vec3 rotate(vec3 r, float v){ return vec3(r.x*cos(v)+r.z*sin(v),r.y,r.z*cos(v)-r.x*sin(v));}
float noise(vec3 x )
{
	float  z = x.z*128.0;
	vec2 offz = vec2(0.317,0.123);
	vec2 uv1 = x.xy + offz*floor(z); 
	vec2 uv2 = uv1  + offz;
	// return mix(textureLod(noise_albedo, uv1 ,0.0).x,textureLod(noise_albedo, uv2 ,0.0).x,fract(z))-0.5;
	return mix(textureLod(noisebig_albedo, uv1 ,0.0).x,textureLod(noisebig_albedo, uv2 ,0.0).x,fract(z))-0.5;
    //return mix(noiseOctave(uv1,6),noiseOctave(uv2,6),fract(z))-0.5;
}

float noises(vec3 p){
	float a = 0.0;
	for(float i=1.0;i<6.0;i++){
		a += noise(p)/i;
		p = p*2.0 + vec3(0.0,a*0.001/i,a*0.0001/i);
	}
	return a;
}



float gaussian(float a,vec2 std,vec2 cp,vec2 cen){
	// return a*exp(-pow(cp.x-cen.x,2)/(2*pow(std.x,2))-pow(cp.y-cen.y,2)/(2*pow(std.y,2)));
		return a*exp(-pow(0.7 *noiseOctave(cp,1)+cp.x-cen.x,2)/(2*pow(std.x,2))-pow(cp.y-cen.y,2)/(2*pow(std.y,2)));


}
float height(vec2 v){
    float h = 0;
	float gterm=0;
	float gterm_fac=0.5;
	float time = (iTime)*.3;
	float speed=0.5;

	float stdpara=1.2;
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
		// h=10*exp(noiseOctave(v+time*vec2(1,-1),8))*gterm+gterm_fac*gterm;
		// h=sin(time)*10*exp(noiseOctave(v,8))*gterm+gterm_fac*gterm;
		h=20*noises(vec3(v.x+speed*time,v.y-speed*time,0.1*time))*gterm+gterm_fac*gterm;
	}
	// if(h<0.5){p
	// 	h*=0.1f;
	// }


	// Your implementation ends here
	return h;
}
float base( in vec3 p){
    return noise(p*0.00002)*1200.0;
}

float ground( in vec3 p){
    return base(p)+noises(p.zxy*0.00005+10.0)*40.0*(0.0-p.y*0.01)+p.y;
}

float clouds( in vec3 p){
    float b = base(p);
    p.y += b*0.5/abs(p.y) + 100.0;
    return noises(vec3(p.x*0.3+((time)*30.0),p.y,p.z)*0.00002)-max(p.y,0.0)*0.00009;
}


vec3 compute_normal(vec2 v, float d)
{	
	vec3 normal_vector = vec3(0,0,0);
	// Your implementation starts here
	vec3 v1 = vec3(v.x + d, v.y, height(vec2(v.x + d, v.y)));
	vec3 v2 = vec3(v.x - d, v.y, height(vec2(v.x - d, v.y)));
	vec3 v3 = vec3(v.x, v.y + d, height(vec2(v.x, v.y + d)));
	vec3 v4 = vec3(v.x, v.y - d, height(vec2(v.x, v.y - d)));

	normal_vector=normalize(cross((v2-v1),(v4-v3)));

	// Your implementation ends here
	return normal_vector;
}

///////////// Part 2c /////////////////////
/* complete the get_color function by setting emissiveColor using some function of height/normal vector/noise */
/* put your Phong/Lambertian lighting model here to synthesize the lighting effect onto the terrain*/

vec3 get_color(vec2 v)
{
	time = (iTime)*.100;
	vec3 vtx_normal = compute_normal(v, 0.01);
	vec2 uv=vtx_uv;
	uv=uv*10.f;
	vec3 emissiveColor = vec3(0,0,0);
	vec3 lightingColor= vec3(1,1,1);

	// Your implementation starts here

	/*This part is the same as your previous assignment. Here we provide a default parameter set for the hard-coded lighting environment. Feel free to change them.*/
	const vec3 LightPosition = vec3(2, 2, 5);
	const vec3 LightIntensity = vec3(30);
	const vec3 ka = 0.1*vec3(.28,.28,.89);
	const vec3 kd = 0.5*vec3(.71,.8,.86);
	// const vec3 ks = vec3(0,0,0);
	vec3 ks = vec3(0,0,0);
	const float n = 400.0;
	const int p=2;

	vec3 normal = normalize(vtx_normal.xyz);
	vec3 lightDir = LightPosition - vtx_pos;
	float _lightDist = length(lightDir);
	vec3 _lightDir = normalize(lightDir);
	vec3 _localLight = LightIntensity / (_lightDist * _lightDist);
	vec3 ambColor = ka;
	vec3 r=vec3(-lightDir+2*dot(lightDir,normal.xyz)*normal.xyz);
	float vr=dot((position.xyz-vtx_pos.xyz),r);


	// if(ch<=0.08){
	if(ch==0.05*0.5){
		//emissiveColor=mix(vec3(0,0.19,0.33),vec3(.25,.47,.72),ch);
		ks = 0.0005*vec3(1,1,1);
		vec3 wat=vec3(vtx_pos.xyz);
		float tx = cos(wat.x*.052) *4.5;
		float ty = sin(wat.y*.072) *4.5;
		vec2 co = Noise2(vec2(wat.x*4.7+1.3+ty, wat.y*4.69+time*35.0-tx));
		co += Noise2(vec2(wat.y*8.6+time*13.0-tx, wat.x*8.712+ty))*.4;
		//vec3 nor = normalize(vec3(co.x, 20.0, co.y));
		//nor = normalize(reflect(dir, nor));
		//tx = wat.z-height(v);
		//emissiveColor=0.5 + 0.5 * (noiseOctave(vtx_pos.xy, 6,1))  * vec3(1,0,0);
		//emissiveColor=mix(vec3(0.,0.3,0.5),vec3(0,0.41,0.58),noiseOctave(vtx_pos.xy, 6,1));
		// emissiveColor=mix(vec3(0,0.41,0.58),vec3(0.,0.24,0.35),sin(iTime)*co.x*co.y);
		// emissiveColor=mix(vec3(0,0.41,0.58),vec3(0.,0.24,0.35),sin(0.0001*time)*co.x*co.y);
		emissiveColor=mix(vec3(0,0.41,0.58),vec3(0.,0.24,0.35),co.x*co.y);
		 //emissiveColor=mix(vec3(0.93,0.97,0.98),vec3(0.53,0.81,0.92),co.x*co.y);
	}

		////////////////river bank////////////////
	else if(height(v)>0.025&&height(v)<0.08){
		// frag_color=vec4(texture(grass_albedo,uv).rgb,1.f);
		vec3 riverbank=vec3(texture(riverbank_albedo,uv).rgb);
		if(distance(vtx_pos.xy,vec2(1.3,1.2))<5){
			emissiveColor=vec3(riverbank.rgb);
		}
		else if(distance(vtx_pos.xy,vec2(4,0.8))<2.5){
			emissiveColor=vec3(riverbank.rgb);
		}
		else if(distance(vtx_pos.xy,vec2(0.8,3.8))<2.5){
			emissiveColor=vec3(riverbank.rgb);
		}
		else if(distance(vtx_pos.xy,vec2(4.5,4.5))<2.5){
			//frag_color = vec4(get_color(vtx_pos.xy),1.f);
			emissiveColor=vec3(riverbank.rgb);
		}
		else{
			emissiveColor=vec3(riverbank.rgb);
		}
	}
	//////////////////transition from riverbank to grass/////////////////
	else if(height(v)>=0.08&&height(v)<0.2){
		emissiveColor=mix(texture(riverbank_albedo,uv).rgb,texture(tree_albedo,uv).rgb,vtx_pos.z);
	}

	//////////////////transition from grass to rock/////////////////
	else if(height(v)>=0.2&&height(v)<1.2){
		emissiveColor=mix(texture(tree_albedo,uv).rgb,texture(rock_albedo,uv).rgb,vtx_pos.z);
	}

	/////////////////mountain top////////////////
	else{
		emissiveColor=vec3(texture(rock_albedo,uv).rgb);
	}
	
    return emissiveColor;
}

vec3 get_light(vec2 v)
{
	float time = (iTime)*.3;
	vec3 vtx_normal = compute_normal(v, 0.01);
	vec2 uv=vtx_uv;
	vec3 emissiveColor = vec3(0,0,0);
	vec3 lightingColor= vec3(1,1,1);

	// Your implementation starts here
	

	/*This part is the same as your previous assignment. Here we provide a default parameter set for the hard-coded lighting environment. Feel free to change them.*/
	vec3 LightPosition = vec3(2, 2, 5);
	vec3 LightIntensity = vec3(40);
	vec3 ka = 0.1*vec3(.28,.28,.89);
	vec3 kd = 0.5*vec3(.71,.8,.86);
	// const vec3 ks = vec3(0,0,0);
	vec3 ks = vec3(0,0,0);
	float n = 400.0;
	int p=2;

	vec3 normal = normalize(vtx_normal.xyz);
	vec3 lightDir = LightPosition - vtx_pos;
	float _lightDist = length(lightDir);
	vec3 _lightDir = normalize(lightDir);
	vec3 _localLight = LightIntensity / (_lightDist * _lightDist);
	vec3 ambColor = ka;
	vec3 r=vec3(-lightDir+2*dot(lightDir,normal.xyz)*normal.xyz);
	vec4 I_a=vec4(0.f,1.f,0.f,1.f);

	// float vr=dot((position.xyz-vtx_pos.xyz),r);
	float vr=dot((position.xyz-vec3(v,height(v))),r);

	if(ch==0.05*0.5){
		LightPosition = vec3(2, 2, 10);
		LightIntensity = vec3(80);
		// ka = 0.1*vec3(.28,.28,.89);
		// kd = 0.5*vec3(.71,.8,.86);
		ka = 0.3*vec3(1,1,1);
		kd = vec3(1,1,1);
		if(normal.z<0.5){
			ks = 0.01*vec3(1,1,1);
		}
		else{
			ks = 0.001*vec3(1,1,1);
		}
		p=2;
	}

	// if(compute_normal(v).z<.5){
	// 	float v = compute_normal(v).z;
	// 	float c = (.5-compute_normal(v).z) * 4.0;
	// 	c = clamp(c*c, 0.1, 1.0);
	// 	f = Noise(vec2(v.x*.09, v.y*.095+height(v)*0.15));
	// 	f += Noise(vec2(v.x*2.233, v.y*2.23))*0.5;
	// 	mat = mix(mat, vec3(.4*f), c);
	// 	ks*=1.1;

	// }

	// lightingColor = k_a*I_a+kd * _localLight * max(0., dot(_lightDir, normal))+ks*_localLight*pow(max(0,vr),p);
    lightingColor = ka*_localLight+kd * _localLight * max(0., dot(_lightDir, normal))+ks*_localLight*pow(max(0,vr),p);

	return lightingColor;

}

void main()
{
	time = (iTime)*.3;
	vec2 uv=vtx_uv;
	uv=uv*10.f;
    
    vec2 iResolution =vec2(1280.0, 960.0);
vec3 LightPosition = vec3(2, 2, 5);
    vec2 uv_1     = vtx_pos.xy/(iResolution.xx*0.5)-vec2(1.0,iResolution.y/iResolution.x);
    vec3 campos   = vec3(30.0,500.0,time*8.0);
         campos.y = 500.0-base(campos);
    vec3 ray   = rotate(normalize(vec3(uv_1.x,uv_1.y-sin(time*0.05)*0.2-0.1,1.0).xyz),time*0.01);
    //vec3 pos    = campos+ray;
    vec3 pos    = campos+LightPosition;
    vec3 sun    = vec3(0.0,0.6,-0.4);

    // raymarch
    float test  = 0.0;
    float fog   = 0.0;
    float dist  = 0.0;

    vec3  p1 = vtx_pos;
    for(float i=1.0;i<50.0;i++){
        test  = ground(p1);
        fog  += max(test*clouds(p1),fog*0.02);
        p1   += ray*min(test,i*i*0.5);
        dist += test;
        if(abs(test)<10.0||dist>40000.0) break;
    }

    float l     = sin(dot(ray,sun));
    vec3  light = vec3(l,0.0,-l)+ray.y*0.2;
    
    float f = smoothstep(0.0,800.0,fog);
    vec3  cloud = vec3(0.70,0.72,0.70)+light*0.05+sin(fog*0.0002)*0.2+noise(p1)*0.05;

	/////////////////multiplied by light///////////////
	frag_color=vec4(get_color(vtx_pos.xy)*get_light(vtx_pos.xy) + (max(noiseOctave(vtx_pos.xy,6),0.0) + mod(time*10, 2.)/2.)*vec3(sqrt(smoothstep(0.2,1.0,mix(get_color(vtx_pos.xy)*get_light(vtx_pos.xy),cloud,f)-dot(uv_1,uv_1)*0.1))),1.f);

}
