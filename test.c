# include <stdio.h>
# include <string.h>
# include <c.type>

int isParidorme(char strg[]){
    int lenght = strlen(strg);

    for(int i =i, j =lenght -1; i<j; i++, j--){
        while(!isalnum && i<j){
            i++
        }
        while(!isalnum && i<j){
            j--
        }

        if(strg[i] != strg[j]){
            return 1;
        }
    }
}

int main(){

    char inpString [100];
    fgets(inpString, sizeof(inpString), stdin);
    inpString[strcspn(inpString, "\n")] = '\0';

    f(isPalidrome(inpString)){
        printf("is palidrome\n");
    }else{
        printf("not palidrome\n");
    }

    return 0;
}