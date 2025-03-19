
#include <stdio.h>
#include "task.h"

int main()
{
    int test_accepted = 0;
    int test_count = 0;
    if (factorial(0) == 1)
        test_accepted++;
    else
        printf("Test factorial(0) failed\n");
    test_count++;

    if (factorial(1) == 1)
        test_accepted++;
    else
        printf("Test factorial(1) failed\n");
    test_count++;

    if (factorial(5) == 120)
        test_accepted++;
    else
        printf("Test factorial(5) failed\n");
    test_count++;

    if (factorial(7) == 5040)
        test_accepted++;
    else
        printf("Test factorial(7) failed\n");
    test_count++;

    printf("Tests passed: %d/%d\n", test_accepted, test_count);
    printf("status: %s\n", test_accepted == test_count ? "SUCCESS" : "FAILED");
    return 0;
}