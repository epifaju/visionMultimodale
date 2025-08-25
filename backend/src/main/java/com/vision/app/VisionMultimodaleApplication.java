package com.vision.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.vision.app")
public class VisionMultimodaleApplication {

    public static void main(String[] args) {
        SpringApplication.run(VisionMultimodaleApplication.class, args);
    }

}
