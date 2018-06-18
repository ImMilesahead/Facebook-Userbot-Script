#include <iostream>
#include <cstdlib>
#include <ctime>
#include <fstream>
#include <cmath>

#define e 2.71828

class FFNN{
private:
  int inputSize;
  int hiddenSize;
  int outputSize;

  float *inputLayer;
  float *hiddenLayer;
  float *outputLayer;

  float **inputHidden;
  float **hiddenOutput;

  float trainingRate = 1;

public:
  FFNN();
  FFNN(int, int, int);
  float *run(float *);
  void outputAsJSON();
  void outputAsJSON(std::string);
  float sigmoid(float);
  void train(float*, float*);

};

FFNN::FFNN(){

}

FFNN::FFNN(int inputSize, int hiddenSize, int outputSize){
    this->inputSize = inputSize;
    this->hiddenSize = hiddenSize;
    this->outputSize = outputSize;

    this->inputLayer = new float[this->inputSize];
    this->hiddenLayer = new float[this->hiddenSize];
    this->outputLayer = new float[this->outputSize];

    // The +1 is for the bias node
    // The bias node will always have an "input" of 1 and thus we just need the weight
    // To be added during run()
    this->inputHidden = new float*[this->inputSize+1];
    for(int i = 0; i < this->inputSize+1; ++i){
        this->inputHidden[i] = new float[this->hiddenSize];
        for(int j = 0; j < this->hiddenSize; ++j){
          this->inputHidden[i][j] = static_cast<float>(rand() % 100 + 1)/100;
        }
    }
    this->hiddenOutput = new float*[this->hiddenSize+1];
    for(int i = 0; i < this->hiddenSize+1; ++i){
        this->hiddenOutput[i] = new float[this->outputSize];
        for(int j = 0; j < this->outputSize; ++j){
          this->hiddenOutput[i][j] = static_cast<float>(rand() % 100 + 1)/100;
        }
    }
}

void FFNN::outputAsJSON(){
  this->outputAsJSON("temp.json");
}
void FFNN::outputAsJSON(std::string fileName){
    std::ofstream myFile;
    myFile.open(fileName);
    myFile << "{\"inputHidden\":[[";
    for(int i = 0; i < this->inputSize; ++i){
      for(int j = 0; j < this->hiddenSize; ++j){
        myFile << this->inputHidden[i][j];
        if(j < this->hiddenSize-1){
          myFile << ", ";
        }
      }
      myFile << "]";
      if(i < this->inputSize-1){
        myFile << ", [";
      }
    }
    myFile << "],\"hiddenOutput\":[[";
    for(int i = 0; i < this->hiddenSize; ++i){
      for(int j = 0; j < this->outputSize; ++j){
        myFile << this->hiddenOutput[i][j];
        if(j < this->outputSize-1){
          myFile << ", ";
        }
      }
      myFile << "]";
      if(i < this->hiddenSize-1){
        myFile << ", [";
      }
    }
    myFile << "]}";
    myFile.close();
}

float FFNN::sigmoid(float X){
  return static_cast<float>(1)/(1+pow(e, -X));
}

float *FFNN::run(float* X){
  this->inputLayer = X;
  // Calculate hiddenLayer
  for(int i = 0; i < this->hiddenSize; ++i){
    // This is the bias node
    this->hiddenLayer[i] = this->inputHidden[this->inputSize][i];
    for(int j = 0; j < this->inputSize; ++j){
      this->hiddenLayer[i] += this->inputLayer[j] * this->inputHidden[j][i];
    }
    this->hiddenLayer[i] = this->sigmoid(this->hiddenLayer[i]);
  }
  // Claulate outputLayer
  if(this->outputLayer == nullptr){
    this->outputLayer = new float[this->outputSize];
  }
  for(int i = 0; i < this->outputSize; ++i){
    // This is a bias layer
    this->outputLayer[i] = this->hiddenOutput[this->hiddenSize][i];
    for(int j = 0; j < this->hiddenSize; ++j){
      this->outputLayer[i] += this->hiddenOutput[j][i] * this->hiddenLayer[j];
    }
    this->outputLayer[i] = this->sigmoid(this->outputLayer[i]);
    std::cout << this->outputLayer[i] << " ";
  }
  std::cout << "\n";
  return this->outputLayer;
}
void FFNN::train(float *X, float *Y){
  this->run(X);
  //Claulate Loss
  float loss = 0;
  for(int i = 0; i < this->outputSize; ++i){
    loss += static_cast<float>(std::pow(this->outputLayer[i] - Y[i], 2))/2;
  }
  std::cout << "Loss: " << loss << std::endl;
  // That's cool but useless
  float *outputDeltas = new float[this->outputSize];

  float **outputDiffs = new float*[this->hiddenSize+1];
  for(int i = 0; i < this->hiddenSize+1; ++i){
    outputDiffs[i] = new float[this->outputSize];
  }
  for(int outputNode = 0; outputNode < this->outputSize; ++outputNode){
    float l = this->outputLayer[outputNode] - Y[outputNode];
    outputDeltas[outputNode] = l * this->outputLayer[outputNode] * (1 - this->outputLayer[outputNode]);
    for(int hiddenNode = 0; hiddenNode < this->hiddenSize; ++hiddenNode){
      outputDiffs[hiddenNode][outputNode] = outputDeltas[outputNode] * this->hiddenLayer[hiddenNode] * this->trainingRate * -1;
    }
    outputDiffs[this->hiddenSize][outputNode] = outputDeltas[outputNode] * this->trainingRate * -1;
  }

  float *hiddenDeltas = new float[this->hiddenSize];

  float **hiddenDifs = new float*[this->inputSize+1];
  for(int i = 0; i < this->inputSize+1; ++i){
    hiddenDifs[i] = new float[this->hiddenSize];
  }
  for(int hiddenNode = 0; hiddenNode < this->hiddenSize; ++hiddenNode){
    hiddenDeltas[hiddenNode] = this->hiddenLayer[hiddenNode] * (1 - this->hiddenLayer[hiddenNode]);
    float sum = 0;
    for(int outputNode = 0; outputNode < this->outputSize; ++outputNode){
      sum += outputDeltas[outputNode] * this->hiddenOutput[hiddenNode][outputNode];
    }
    hiddenDeltas[hiddenNode] *= sum;
    for(int inputNode = 0; inputNode < this->inputSize; ++inputNode){
      hiddenDifs[inputNode][hiddenNode] = hiddenDeltas[hiddenNode] * this->inputLayer[inputNode] * this->trainingRate * -1;
    }
    hiddenDifs[this->inputSize][hiddenNode] = hiddenDeltas[hiddenNode] * this->trainingRate * -1;
  }
  for(int hiddenNode = 0; hiddenNode < this->hiddenSize; ++hiddenNode){
    for(int outputNode = 0; outputNode < this->outputSize; ++outputNode){
      this->hiddenOutput[hiddenNode][outputNode] += outputDiffs[hiddenNode][outputNode];
    }
    for(int inputNode = 0; inputNode < this->inputSize; ++inputNode){
      this->inputHidden[inputNode][hiddenNode] += hiddenDifs[inputNode][hiddenNode];
    }
  }
}

int main(){
    srand(time(0));
    std::cout << "Hello, World!\n";
    FFNN ffnn(2, 3, 1);
    ffnn.outputAsJSON("before.json");
    float **input = new float*[4];
    float **output = new float*[4];
    for(int i = 0; i < 4; ++i){
      input[i] = new float[2];
      output[i] = new float[1];
    }
    input[0][0] = 0;
    input[0][1] = 0;
    input[1][0] = 0;
    input[1][1] = 1;
    input[2][0] = 1;
    input[2][1] = 0;
    input[3][0] = 1;
    input[3][1] = 1;
    output[0][0] = 0;
    output[1][0] = 1;
    output[2][0] = 1;
    output[3][0] = 0;
    for(int i = 0; i < 100000; ++i){
      float *in = input[i%4];
      float *out = output[i%4];
      ffnn.train(in, out);
    }
    for(int i = 0; i < 4; ++i){
      ffnn.run(input[i]);
    }
    ffnn.outputAsJSON("after.json");
    return 0;
}
