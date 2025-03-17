#include <stdio.h>
#include "task_1.h"

int power_ranger(int x, int y)
{
    int result = 1;
    for (int i = 0; i < y; i++)
    {
        result *= x;
    }
    return result;
}

int main()
{
    printf("%d\n", power_ranger(2, 3));
    return 0;
}